import { Component, OnInit, ViewChild, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '@enum/Params';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { DynamicGridReportService } from '@matbia/matbia-query-report/API/dynamic-grid-report.service';
import { AuthenticatedUserResponse } from '@services/API/auth.service';
import { CSAgentAPIService } from '@services/API/csagent-api.service';
import { SettingAPIService } from '@services/API/setting-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { environment } from 'src/environments/environment';
import { UserTypes } from '@enum/UserTypes';

import { SharedModule } from '@matbia/shared/shared.module';
import { CSLogPortalComponent } from '../cslog-portal/cslog-portal.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { ReportTableComponent } from '@matbia/matbia-query-report/report-table/report-table.component';
import { MatbiaQueryReportService } from '@matbia/matbia-query-report/matbia-query-report.service';

@Component({
  selector: 'app-enter-donor-portal',
  templateUrl: './enter-donor-portal.component.html',
  styleUrls: ['./enter-donor-portal.component.scss'],
  imports: [SharedModule, CSLogPortalComponent, InputErrorComponent, ReportTableComponent],
})
export class EnterDonorPortalComponent implements OnInit {
  protected IPAddress = signal<string>('');

  protected isNewChange = signal<boolean>(false);

  public reportParamsForm: any = new FormGroup({});

  formGroup!: FormGroup;

  public dashboardUrl = PageRouteVariable.DashboardUrl;
  reportUserData: any;
  userHandle: string | null = '';
  showParams: boolean = false;
  reportId: WritableSignal<number | null> = signal(null);

  reportFilter = inject(MatbiaQueryReportService);

  get EntityId() {
    return this.formGroup.get('entityId');
  }

  get reportParams() {
    return this.reportParamsForm.get('reportParamsArray') as FormArray;
  }

  @ViewChild('confirmActionModal') confirmActionModal: any;

  name!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private apiService: DynamicGridReportService,
    private csAgentAPI: CSAgentAPIService,
    private localStorageDataService: LocalStorageDataService,
    private notification: NotificationService,
    private settingAPI: SettingAPIService,
    private panelPopup: PanelPopupsService,
    private matbiaObserver: MatbiaObserverService
  ) {}

  ngOnInit(): void {
    this.apiService.getIPAddress().subscribe(
      (res) => {
        if (res && res.ip) {
          this.IPAddress.set(res.ip);
          if (this.EntityId?.value) {
            this.doAction();
          }
        }
      },
      () => {
        this.notification.showError('IP Error');
      }
    );
    this.formGroup = this.fb.group({
      entityId: this.fb.control(null, Validators.compose([Validators.required])),
    });

    this.activeRoute.queryParamMap.subscribe((params) => {
      const hasShulKiosk = params.get(Params.SHUL_KIOSK);

      if (hasShulKiosk) {
        this.dashboardUrl = `${this.dashboardUrl}?${Params.SHUL_KIOSK}=true`;
      }

      if (params.has(Params.BLOCK_BANK_MANAGEMENT)) {
        const hasBlockManagement = params.get(Params.BLOCK_BANK_MANAGEMENT);
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${Params.BLOCK_BANK_MANAGEMENT}=${hasBlockManagement}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${Params.BLOCK_BANK_MANAGEMENT}=${hasBlockManagement}`;
        }
      }

      if (params.has(Params.BLOCK_PLAID)) {
        const hasBlockPlaid = params.get(Params.BLOCK_PLAID);
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${Params.BLOCK_PLAID}=${hasBlockPlaid}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${Params.BLOCK_PLAID}=${hasBlockPlaid}`;
        }
      }

      if (
        (params.has(Params.UTM_CAMPAIGN) ||
          params.has(Params.UTM_MEDIUM) ||
          params.has(Params.UTM_SOURCE) ||
          params.has(Params.UTM_SOURCE)) &&
        environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER
      ) {
        const utm_c = params.get(Params.UTM_CAMPAIGN);
        const utm_m = params.get(Params.UTM_MEDIUM);
        const utm_s = params.get(Params.UTM_SOURCE);
        const utm_id = params.get(Params.UTM_ID);
        const utnQuery = `${Params.UTM_CAMPAIGN}=${utm_c}&${Params.UTM_MEDIUM}=${utm_m}&${Params.UTM_SOURCE}=${utm_s}&${Params.UTM_ID}=${utm_id}`;
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${utnQuery}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${utnQuery}`;
        }
      }

      this.userHandle = params.get(Params.USER_HANDLE);

      if (this.userHandle) {
        this.EntityId?.patchValue(this.userHandle);
        this.EntityId?.updateValueAndValidity();

        if (this.IPAddress()) {
          this.logoutAndDoAction();
        }
      } else {
        this.getReports();
      }

      const switching = params.get('switch');
      if (switching) {
        this.isNewChange.set(true);
      }
    });
  }

  onSubmit() {
    if (this.EntityId?.hasError('serverError')) {
      if (this.EntityId?.errors) {
        const { serverError, ...errors } = this.EntityId?.errors;
        this.EntityId?.setErrors(errors);
        this.EntityId?.updateValueAndValidity();
      }
    }

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.doAction();
  }

  private logoutAndDoAction() {
    const reportUserData = this.localStorageDataService.getLoginUserData();
    if (reportUserData && reportUserData?.userType !== UserTypes.REPORT) {
      this.csAgentAPI.CSAgentlogout().subscribe((res) => {
        this.localStorageDataService.setReportData(res);
        this.doAction();
      });

      return;
    }
  }

  private doAction() {
    this.csAgentAPI.getAgentLogin(this.EntityId?.value).subscribe((data) => {
      const modalRef = this.panelPopup.open(this.confirmActionModal, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'donate-popup',
        size: 'xl',
        scrollable: true,
      });

      this.name = `${data.firstName || ''} ${data.lastName || ''}`;

      modalRef.closed.subscribe((res) => {
        if (res) {
          const reportUserData = this.localStorageDataService.getLoginUserData();
          if (reportUserData && reportUserData?.userType !== UserTypes.REPORT) {
            this.matbiaObserver.broadCastMessage(null);
          }

          if (this.localStorageDataService.isReport()) {
            this.localStorageDataService.setReportData(reportUserData);
          }

          this.localStorageDataService.setLoginUserDataAndToken(data);
          this.checkUserRole(data);
          return;
        }

        this.router.navigate([`/${PageRouteVariable.DashboardUrl}`]);
      });
    });
  }

  /**
   * Check is User is Donor then Follow Donor steps. if not then do nothing
   * @param _res AuthenticatedUserResponse
   * @returns
   */
  private followDonorUser(_res: AuthenticatedUserResponse) {
    if (!this.localStorageDataService.isDonor()) {
      return;
    }

    location.href = this.dashboardUrl;
  }

  /**
   * Check is User is Organization then follow Organization steps.
   * @param _res
   * @returns
   */
  private followOrganizationUser(_res: AuthenticatedUserResponse) {
    if (!(this.localStorageDataService.isOrganization() || this.localStorageDataService.isBusiness())) {
      return;
    }

    /**
     * Call Entity Setting API call and saved in local storage and then redirect
     */
    this.settingAPI.getEntitySetting('UseBatchAsRedeem').subscribe((settingRes) => {
      if (!settingRes) {
        return;
      }

      this.localStorageDataService.setEntitySetting(settingRes);

      location.href = this.dashboardUrl;
    });
  }

  /**
   * Check authenticated User for role based and follow necessary steps
   * @param res AuthenticatedUserResponse
   */
  private checkUserRole(res: AuthenticatedUserResponse) {
    this.followDonorUser(res);

    this.followOrganizationUser(res);
  }

  private getReports() {
    this.apiService.getAllReport().subscribe((reports) => {
      const reportId = reports?.find((report) => report.reportName == 'CS Access')?.reportId || null;
      this.reportId.set(reportId);
      this.initializeReportsForm();
      this.getReportParams();
    });
  }

  private getReportParams() {
    this.apiService.getReportParams(this.reportId()!).subscribe((queryParams) => {
      if (queryParams && queryParams?.length > 0) {
        queryParams.map((o) => {
          this.reportParams.push(
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
        this.showParams = true;
      }
    });
  }

  initializeReportsForm() {
    this.reportParamsForm = this.fb.group({
      reportParamsArray: this.fb.array([]),
    });
  }

  executeQuery() {
    const payload: any = {};
    payload['reportParam'] = this.reportParams.value;
    payload['Params'] = this.reportParams.value.map((o: any) => {
      if (o.uiDataType === 'INT') {
        return {
          name: o.name,
          value: o.inputValue ? Number(o.inputValue) : o.inputValue,
        };
      }
      return {};
    });
    payload['ipAddress'] = this.IPAddress();
    payload['reportId'] = this.reportId();

    this.apiService.executeReport(payload).subscribe(
      (res) => {
        if (res && res.table) {
          this.formGroup.get('entityId')?.setValue(res.table[0]?.username);
          this.reportFilter.ListData = res.table;
        } else {
          this.formGroup.get('entityId')?.setValue(null);
          this.reportFilter.ListData = [];
        }
      },
      (err) => {
        this.formGroup.get('entityId')?.setValue(null);
        this.reportFilter.ListData = [];
      }
    );
  }
}
