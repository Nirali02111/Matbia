import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { shakeTrigger } from '@commons/animations';
import { NotificationService } from '@commons/notification.service';
import { DynamicGridReportService, ReportObj, RepostItemObj } from '../API/dynamic-grid-report.service';
import { MatbiaQueryReportService } from '../matbia-query-report.service';

interface ParamFormGroup {
  name: string;
  gridReportQueryParamId: number;
  uiControl: string;
  uiDataType: string;
  inputValue: any;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { ReportTableComponent } from '../report-table/report-table.component';

@Component({
  selector: 'app-matbia-query-report-list',
  templateUrl: './matbia-query-report-list.component.html',
  styleUrls: ['./matbia-query-report-list.component.scss'],
  imports: [SharedModule, ReportTableComponent],
  animations: [shakeTrigger],
})
export class MatbiaQueryReportListComponent implements OnInit {
  private IPAddress!: string;
  isLoading = false;
  inAnimation = false;
  reportList: Array<ReportObj> = [];

  dataList: Array<RepostItemObj> = [];

  filterFormgroup!: UntypedFormGroup;

  open = 'center';
  drop = 'down';
  showClearButton = false;
  alwaysShowCalendars = true;
  showRangeLabelOnInput = true;
  placeholder = 'Select Date Range';
  showCustomRangeLabel = false;
  linkedCalendars = false;

  get ReportId() {
    return this.filterFormgroup.get('reportId');
  }

  get ReportParams() {
    return this.filterFormgroup.get('reportParam') as UntypedFormArray;
  }

  tableHeaders$!: Observable<Array<string>>;
  transactions$!: Observable<Array<RepostItemObj>>;
  total$!: Observable<number>;

  constructor(
    private fb: UntypedFormBuilder,
    private apiService: DynamicGridReportService,
    public reportFilter: MatbiaQueryReportService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.filterFormgroup = this.fb.group({
      reportId: [null, Validators.required],
      reportParam: this.fb.array([]),
    });

    this.ReportId?.valueChanges.subscribe((val) => {
      if (val) {
        this.getParamsOfReport();
        return;
      }

      this.ReportParams.clear();
      this.filterFormgroup.updateValueAndValidity();
    });

    this.getList();

/*     this.apiService.getIPAddress().subscribe(
      (res) => {
          this.getList();
      },
      () => {
        this.notification.showError('IP Error');
      }
    ); */
  }

  getList() {
    this.isLoading = true;
    this.apiService.getAllReport().subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.reportList = res;
        }
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error);
      }
    );
  }

  canDisplayParams() {
    return this.ReportParams.length !== 0;
  }

  getParamsOfReport() {
    const reportId = this.ReportId?.value;

    this.apiService.getReportParams(reportId).subscribe(
      (res) => {
        if (res) {
          if (res.length !== 0) {
            this.ReportParams.clear();
            this.filterFormgroup.updateValueAndValidity();

            res.map((o) => {
              this.ReportParams.push(
                this.fb.group({
                  name: this.fb.control(o.paramName, Validators.compose([Validators.required])),
                  parameterDisplayName: this.fb.control(o.parameterDisplayName),
                  gridReportQueryParamId: this.fb.control(
                    o.gridReportQueryParamId,
                    Validators.compose([Validators.required])
                  ),
                  uiControl: this.fb.control(o.uiControl, Validators.compose([Validators.required])),
                  uiDataType: this.fb.control(o.uiDataType, Validators.compose([Validators.required])),
                  inputValue: this.fb.control(
                    null,
                    o.isRequired ? Validators.compose([Validators.required]) : Validators.compose([])
                  ),
                })
              );
            });

            this.filterFormgroup.updateValueAndValidity();
          }
        }
      },
      (err) => {
        this.notification.showError(err.error);
      }
    );
  }

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  executeQuery() {
    if (this.filterFormgroup.invalid) {
      this.filterFormgroup.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    const values = this.filterFormgroup.value;

    if (values.reportParam && values.reportParam.length !== 0) {
      values.Params = values.reportParam.map((o: ParamFormGroup) => {
        if (o.uiDataType === 'DateTime') {
          return {
            name: o.name,
            value: o.inputValue && o.inputValue.startDate ? o.inputValue.startDate : o.inputValue,
          };
        }

        if (o.uiDataType === 'INT') {
          return {
            name: o.name,
            value: o.inputValue ? Number(o.inputValue) : o.inputValue,
          };
        }

        return {
          name: o.name,
          value: o.inputValue,
        };
      });
    }

    this.isLoading = true;
    this.apiService.executeReport({ ...values, ipAddress: this.IPAddress }).subscribe(
      (res) => {
        this.isLoading = false;
        this.reportFilter.ListData = res.table || [];
      },
      (err) => {
        this.isLoading = false;
        this.reportFilter.ListData = [];
        this.notification.showError(err.error);
      }
    );
  }

  exportQueryData() {
    const reportObj = this.reportList.find((o) => o.reportId === this.ReportId?.value);
    this.reportFilter.exportData(reportObj?.reportName || 'Report');
  }
}
