import { ChangeDetectorRef, Component, Inject, Signal, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { Observable } from 'rxjs';
import { PanelPopupsService } from '../popups/panel-popups.service';
import moment from 'moment';
import dayjs from 'dayjs';

export type yearMonthList = { year: number; months: string[] };
import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-statements-and-reports',
  templateUrl: './statements-and-reports.component.html',
  styleUrl: './statements-and-reports.component.css',
  imports: [SharedModule, MatbiaSkeletonLoaderComponentComponent],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class StatementsAndReportsComponent {
  isLoading: boolean = false;
  isReportsLoading: boolean = false;
  firstTransactionDate: string = '';
  yearToDateList!: yearMonthList[];
  rows$!: Observable<Array<yearMonthList>>;
  searchValue: FormControl<string | null> = new FormControl('');
  reportForm: FormGroup = new FormGroup({});
  modalRef!: NgbModalRef;

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;
  successPopup: Signal<TemplateRef<any> | undefined> = viewChild('successPopupTmp');
  receiptUrl: string = '';
  statementUrl: string = '';
  successPopupModalRef!: NgbModalRef;

  constructor(
    private donorTransactionAPI: DonorTransactionAPIService,
    private localStorage: LocalStorageDataService,
    private panelPopupService: PanelPopupsService,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<yearMonthList>,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.rows$ = this.gridService.rows$;
    this.getAllTransaciton();
    this.searchValue.valueChanges.subscribe((val) => {
      this.gridService.ListData = this.filteredYearToDateList(val as string);
    });
  }

  /** get all transaction and create yearToDateList based on first transaction happened*/
  getAllTransaciton() {
    const username = this.localStorage.getLoginUserUserName();
    this.isLoading = true;
    this.donorTransactionAPI.getAll({ userHandle: username }).subscribe(
      (donorTransactionRes) => {
        this.firstTransactionDate = donorTransactionRes.firstTransactionDate || '';

        const startDate = new Date(this.firstTransactionDate);
        this.yearToDateList = this.generateYearMonthList(startDate);
        this.gridService.ListData = this.yearToDateList;
        this.cdr.detectChanges();

        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  generateYearMonthList(selectedDate: Date): { year: number; months: string[] }[] {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const currentDate = new Date();
    const yearMonthList: { year: number; months: string[] }[] = [];

    let startYear = selectedDate.getFullYear();
    const endYear = currentDate.getFullYear();

    // Loop through each year from the selected date year to the current year
    for (let year = startYear; year <= endYear; year++) {
      let months: string[];

      if (year === startYear && year === endYear) {
        months = monthNames.slice(selectedDate.getMonth(), currentDate.getMonth() + 1);
      } else if (year === startYear) {
        months = monthNames.slice(selectedDate.getMonth());
      } else if (year === endYear) {
        months = monthNames.slice(0, currentDate.getMonth() + 1);
      } else {
        months = monthNames.slice();
      }

      yearMonthList.push({ year, months });
    }

    return yearMonthList;
  }

  /** Filter year and month from yearMonthList based on search term */
  filteredYearToDateList(searchQuery: string) {
    if (!searchQuery) return this.yearToDateList;

    const query = searchQuery.toLowerCase();
    return this.yearToDateList
      .map((yearData) => ({
        year: yearData.year,
        months: yearData.months.filter(
          (month) => month.toLowerCase().includes(query) || yearData.year.toString().includes(query)
        ),
      }))
      .filter((yearData) => yearData.months.length > 0 || yearData.year.toString().includes(query));
  }

  generateReport(reportType: string, year: number, month: string): void {
    const reportData = this.reportForm.value;
    const { fromDate, toDate } = this.calculateDateRange(reportType, year, month, reportData);
    const username = this.localStorage.getLoginUserUserName();
    const selectCount = this.getSelectedCount(reportData);

    if (reportData.receiptOfDeposits || reportType === 'receipt') {
      this.handleReceiptOfDeposits(username, fromDate, toDate, selectCount, reportType);
    }

    if (reportData.statement || reportType === 'statement') {
      this.handleStatement(username, fromDate, toDate, selectCount, reportType);
    }

    if (reportData.downloadCSV || reportType === 'csv') {
      this.handleCSVDownload(username, fromDate, toDate);
    }
  }

  private calculateDateRange(
    reportType: string,
    year: number,
    month: string,
    reportData: any
  ): { fromDate: string | null; toDate: string | null } {
    if (reportType) {
      const dateBase = moment().year(year);
      if (month) {
        return {
          fromDate: dateBase.month(month).startOf('month').format('YYYY-MM-DD'),
          toDate: dateBase.month(month).endOf('month').format('YYYY-MM-DD'),
        };
      }
      return {
        fromDate: dateBase.startOf('year').format('YYYY-MM-DD'),
        toDate: dateBase.endOf('year').format('YYYY-MM-DD'),
      };
    }

    return {
      fromDate: reportData.fromDate ? dayjs(reportData.fromDate.startDate).format('YYYY-MM-DD') : null,
      toDate: reportData.toDate ? dayjs(reportData.toDate.startDate).format('YYYY-MM-DD') : null,
    };
  }

  private getSelectedCount(reportData: any): number {
    return Object.values(reportData).filter((value) => value === true).length;
  }

  private handleReceiptOfDeposits(
    username: string,
    fromDate: any,
    toDate: any,
    selectCount: number,
    reportType: string
  ): void {
    let modalRef: any;
    if (selectCount == 1 || reportType) {
      modalRef = this.panelPopupService.openPDFViewPopup();
    } else this.isReportsLoading = true;

    this.donorTransactionAPI.getBulkDepositReceipt(username, fromDate, toDate).subscribe((fileUrl) => {
      if (selectCount > 1 && !reportType) {
        this.receiptUrl = fileUrl;
        if (this.receiptUrl && this.statementUrl) this.openSuccessPopup();
        this.isReportsLoading = false;
      } else {
        this.previewReportPDf(fileUrl, 'Print Receipts', modalRef);
      }
    });
  }

  private handleStatement(username: string, fromDate: any, toDate: any, selectCount: number, reportType: string): void {
    let modalRef: any;
    if (selectCount == 1 || reportType) {
      modalRef = this.panelPopupService.openPDFViewPopup();
    } else this.isReportsLoading = true;

    this.donorTransactionAPI.getStatement(username, fromDate, toDate).subscribe((fileUrl) => {
      if (selectCount > 1 && !reportType) {
        this.statementUrl = fileUrl;
        if (this.receiptUrl && this.statementUrl) this.openSuccessPopup();

        this.isReportsLoading = false;
      } else {
        this.previewReportPDf(fileUrl, 'Print Statement', modalRef);
      }
    });
  }

  openSuccessPopup() {
    this.successPopupModalRef = this.modalService.open(this.successPopup(), {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: 'drag_popup modal-main modal-report',
      size: 'md',
      scrollable: true,
      fullscreen: 'md',
    });
  }

  private handleCSVDownload(username: string, fromDate: string | null, toDate: string | null): void {
    this.donorTransactionAPI.getAll({ userHandle: username, fromDate, toDate }).subscribe((donorTransactionRes) => {
      this.setTableHeaders();
      this.gridService.exportProcess('Transaction', donorTransactionRes.transactions, true);
    });
  }

  previewReportPDf(pdfUrl: string, title: string, modalRef: NgbModalRef) {
    modalRef.componentInstance.title = title;

    modalRef.componentInstance.pdfUrl = pdfUrl;
  }

  closeModal(modal: string = ''): void {
    if (modal == 'success') {
      this.successPopupModalRef.close();
      this.receiptUrl = '';
      this.statementUrl = '';
      return;
    }
    this.reportForm.reset();
    this.modalRef.close();
  }

  initCustomReportForm() {
    this.reportForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      receiptOfDeposits: [false],
      statement: [false],
      downloadCSV: [false],
    });
  }

  openCustomReportFilter(customReportTmp: TemplateRef<any>) {
    this.initCustomReportForm();
    this.modalRef = this.modalService.open(customReportTmp, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: 'drag_popup modal-main modal-report',
      size: 'md',
      scrollable: true,
      fullscreen: 'md',
    });
  }

  setTableHeaders() {
    if (this.localStorage.isDonor()) {
      this.gridService.TableHeaders = [
        {
          colName: 'Transaction #',
          sortName: 'refNum',
        },
        {
          colName: 'Card #',
          sortName: 'cardLast4Digit',
        },
        {
          colName: 'Creation Date',
          sortName: 'transDate',
        },
        {
          colName: 'Completed Date',
          sortName: 'completedDate',
        },
        {
          colName: 'Org Name',
          sortName: 'organization',
        },
        {
          colName: 'Type',
          sortName: 'transType',
        },
        {
          colName: 'Amount',
          sortName: 'amount',
        },
        {
          colName: 'Status',
          sortName: 'transStatus',
        },
        {
          colName: 'Collector',
          sortName: 'collector',
        },
        {
          colName: 'Method',
          sortName: 'method',
        },
        {
          colName: 'Source',
          sortName: 'source',
        },
        {
          colName: 'Note field',
          sortName: 'note',
        },
        {
          colName: 'Running balance',
          sortName: 'balance',
        },
      ];
    }

    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.gridService.TableHeaders = [
        {
          colName: 'Transaction #',
          sortName: 'refNum',
        },
        {
          colName: 'Creation Date',
          sortName: 'transDate',
        },
        {
          colName: 'Completed Date',
          sortName: 'completedDate',
        },
        {
          colName: 'Donor Name',
          sortName: 'source',
        },
        {
          colName: 'Type',
          sortName: 'transType',
        },
        {
          colName: 'Amount',
          sortName: 'amount',
        },
        {
          colName: 'Status',
          sortName: 'transStatus',
        },
        {
          colName: 'Collector',
          sortName: 'collector',
        },
        {
          colName: 'Note',
          sortName: 'note',
        },
        {
          colName: 'External ID',
          sortName: 'externalTransactionId',
        },
        {
          colName: 'Card ending in',
          sortName: 'cardNum',
        },
        {
          colName: 'Method',
          sortName: 'method',
        },
        {
          colName: 'MID',
          sortName: 'aliasExternalID',
        },
        {
          colName: "Donor's phone number",
          sortName: 'phoneNum',
        },
        {
          colName: 'Batch #',
          sortName: 'batchNum',
        },
      ];
    }
  }
}
