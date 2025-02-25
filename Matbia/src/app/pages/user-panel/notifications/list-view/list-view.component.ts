import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import moment from 'moment';
import { AlertTypes } from '@enum/Alert';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { CommonDataService } from '@commons/common-data-service.service';

import { TransactionAlertFormGroupComponent } from '@matbia/matbia-alert-setting/transaction-alert-form-group/transaction-alert-form-group.component';
import { BalanceAlertFormGroupComponent } from '@matbia/matbia-alert-setting/balance-alert-form-group/balance-alert-form-group.component';
import { ManualEntryAlertFormGroupComponent } from '@matbia/matbia-alert-setting/manual-entry-alert-form-group/manual-entry-alert-form-group.component';
import { MatbiaAlertSettingFormGroupService } from '@matbia/matbia-alert-setting/matbia-alert-setting-form-group.service';

import { AlertSettingAPIService, AlertSettingObj } from '@services/API/alert-setting-api.service';
import { MatbiaCardObj, MatbiaCardSettingService } from '@services/API/matbia-card-setting.service';

import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';
import { PageRouteVariable } from '@commons/page-route-variable';
import { Params } from '@enum/Params';
import { distinctUntilChanged } from 'rxjs/operators';
import { DonorAPIService } from '@services/API/donor-api.service';

export type pageName = 'transaction' | 'request' | 'balance' | 'manual' | 'deposit';
import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    BalanceAlertFormGroupComponent,
    TransactionAlertFormGroupComponent,
    ManualEntryAlertFormGroupComponent,
    DisplayLastPipe,
    MatbiaSkeletonLoaderComponentComponent,
    ButtonLoaderComponent,
  ],
})
export class ListViewComponent implements OnInit {
  isLoading = false;
  isLoadingCards = false;

  activeId = '';
  allowSkipButton = false;

  haveCardId = false;

  listCards: Array<MatbiaCardObj> = [];
  alertSettingList: Array<AlertSettingObj> = [];

  emailList: Array<EmailEntityObj> = [];
  phoneList: Array<PhoneEntityObj> = [];

  cardListFilterFormGroup!: UntypedFormGroup;

  transactionAlertSettingFormGroup!: UntypedFormGroup;
  balanceAlertSettingFormGroup!: UntypedFormGroup;
  depositAlertSettingFormGroup!: UntypedFormGroup;
  manualEntryAlertSettingFormGroup!: UntypedFormGroup;
  requestAlertSettingFormGroup!: UntypedFormGroup;
  pageValidation: { transaction: boolean; request: boolean; balance: boolean; manual: boolean; deposit: boolean } = {
    balance: false,
    manual: false,
    request: false,
    transaction: false,
    deposit: false,
  };

  @ViewChild(TransactionAlertFormGroupComponent) transactionAlertComponent!: TransactionAlertFormGroupComponent;
  @ViewChild(BalanceAlertFormGroupComponent) balanceAlertComponent!: BalanceAlertFormGroupComponent;
  @ViewChild('depositAlert') depositAlertComponent!: BalanceAlertFormGroupComponent;
  @ViewChild(ManualEntryAlertFormGroupComponent) manualEntryAlertComponent!: ManualEntryAlertFormGroupComponent;
  @ViewChild('requestAlert') requestAlertComponent!: TransactionAlertFormGroupComponent;
  noCardsFound: boolean = false;

  emailPhoneRequiredTransaction: boolean = false;
  emailPhoneRequiredRequest: boolean = false;
  emailPhoneRequiredManual: boolean = false;
  emailPhoneRequiredBalance: boolean = false;
  emailPhoneRequiredDeposit: boolean = false;
  disableSave: boolean = false;
  isSaveClicked: boolean = false;

  get SelectedCard() {
    return this.cardListFilterFormGroup.get('selectedCard');
  }

  constructor(
    protected title: Title,
    private fb: UntypedFormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private pageRoute: PageRouteVariable,
    private commonDataService: CommonDataService,
    private localStorage: LocalStorageDataService,
    private notification: NotificationService,
    private matbiaAlertSettingFormGroupService: MatbiaAlertSettingFormGroupService,
    private alertSettingAPI: AlertSettingAPIService,
    private matbiaCardSettingAPI: MatbiaCardSettingService,
    private donorAPI: DonorAPIService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Alerts');
    this.cardListFilterFormGroup = this.fb.group({
      selectedCard: this.fb.control(null),
    });

    this.initForm();
    this.getCardList();
    this.SelectedCard?.valueChanges.pipe(distinctUntilChanged()).subscribe((val) => {
      if (val) {
        this.getAlertSettingList();
      }
    });

    this.activeRouter.queryParamMap.subscribe((params) => {
      const allowSkip = params.get('allowSkip');

      if (allowSkip && this.commonDataService.isStringTrue(allowSkip)) {
        this.allowSkipButton = true;
      }

      const cardId = params.get(Params.CARD_ID);

      if (cardId) {
        this.haveCardId = true;
        this.SelectedCard?.patchValue(cardId);
        this.cardListFilterFormGroup.updateValueAndValidity();
      }
    });
  }

  private initForm() {
    this.transactionAlertSettingFormGroup =
      this.matbiaAlertSettingFormGroupService.initTransactionAlertSettingFormGroup();

    this.balanceAlertSettingFormGroup = this.matbiaAlertSettingFormGroupService.initBalanceAlertSettingFormGroup();

    this.depositAlertSettingFormGroup = this.matbiaAlertSettingFormGroupService.initBalanceAlertSettingFormGroup(true);

    this.manualEntryAlertSettingFormGroup = this.matbiaAlertSettingFormGroupService.initManualAlertSettingFormGroup();

    this.requestAlertSettingFormGroup = this.matbiaAlertSettingFormGroupService.initTransactionAlertSettingFormGroup();
  }

  private getFirstOrSelectedCard(isSelected = false) {
    if (isSelected) {
      const firstCardSel = this.listCards.find((o) => o.cardId === this.SelectedCard?.value);
      return firstCardSel || this.listCards[0];
    }

    return this.listCards[0];
  }

  onNavChange(changeEvent: any) {
    if (changeEvent && changeEvent.nextId) {
      this.SelectedCard?.patchValue(changeEvent.nextId);
      this.cardListFilterFormGroup.updateValueAndValidity();
    }
  }

  private getCardList() {
    this.isLoadingCards = true;
    const userHandle = this.localStorage.getLoginUserUserName();
    this.matbiaCardSettingAPI.GetSetting(userHandle).subscribe(
      (res) => {
        if (!res || res.length === 0) {
          this.getDonors();
          return;
        }
        this.isLoadingCards = false;
        if (res) {
          this.listCards = res.filter((o) => {
            return o.statusID !== -1;
          });

          const firstCard = this.getFirstOrSelectedCard(this.haveCardId);
          this.activeId = firstCard.cardId;
          this.onNavChange({ nextId: firstCard.cardId });
        }
      },
      () => {
        this.isLoadingCards = false;
      }
    );
  }

  private getDonors() {
    const username = this.localStorage.getLoginUserUserName();
    this.donorAPI.get(username).subscribe(
      (res) => {
        this.noCardsFound = true;
        this.isLoading = false;
        if (res) {
          //CHECKHERE
          this.balanceAlertSettingFormGroup.get('entityId')?.setValue(res.donorId);
          this.emailList = [
            {
              entityEmailId: res.entityEmailId,
              email: res.email,
              label: 'Home',
              isDefault: true,
            },
          ];

          this.phoneList = [
            {
              entityPhoneId: res.homePhoneId,
              phone: res.phone,
              label: 'Home',
              isDefault: true,
            },
            {
              entityPhoneId: res.cellPhoneId,
              phone: res.cellPhone,
              label: 'Cell',
              isDefault: false,
            },
          ];
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private getAlertSettingList() {
    this.isLoading = true;
    this.alertSettingAPI.get(this.SelectedCard?.value).subscribe(
      (res) => {
        this.isLoading = false;
        this.alertSettingList = res.alertSettings || [];
        this.emailList = res.emails || [];
        this.phoneList = res.phones || [];

        this.setAlertFormValues();
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private setAlertFormValues() {
    this.bindTransactionAlert();
    this.bindBalanceAlert();
    this.bindDepositAlert();
    this.bindManualEntryAlert();
    this.bindRequestAlert();
  }

  private bindTransactionAlert() {
    const alertObj = this.alertSettingList.find((o) => o.alertType === AlertTypes.TRANSACTIONS);
    this.transactionAlertSettingFormGroup.patchValue({
      encryptedCardId: alertObj?.cardId || this.SelectedCard?.value,
      entityId: alertObj?.entityId,
      isPaused: !alertObj ? false : !alertObj?.isPaused,

      isSendEmail: alertObj?.isSendEmail ? true : false,
      isSendSMS: alertObj?.isSendSMS ? true : false,

      entityAlertSettingId: alertObj?.entityAlertSettingId,
      maxLimit: alertObj?.transMaxLimit,
      entityEmailId: alertObj?.entityEmailId,
      entityPhoneId: alertObj?.entityPhoneId ? alertObj?.entityPhoneId : null,
    });

    this.transactionAlertSettingFormGroup.updateValueAndValidity();
  }

  private bindBalanceAlert() {
    const alertObj = this.alertSettingList.find((o) => o.alertType === AlertTypes.BALANCE);
    this.balanceAlertSettingFormGroup.patchValue({
      encryptedCardId: alertObj?.cardId || this.SelectedCard?.value,
      entityId: alertObj?.entityId,
      isPaused: !alertObj ? false : !alertObj?.isPaused,

      isSendEmail: alertObj?.isSendEmail ? true : false,
      isSendSMS: alertObj?.isSendSMS ? true : false,
      entityAlertSettingId: alertObj?.entityAlertSettingId,

      entityEmailId: alertObj?.entityEmailId,
      entityPhoneId: alertObj?.entityPhoneId ? alertObj?.entityPhoneId : null,

      minAccountBalance: alertObj?.minAccountBalance,
    });

    this.balanceAlertSettingFormGroup.updateValueAndValidity();
  }

  private bindDepositAlert() {
    const alertObj = this.alertSettingList.find((o) => o.alertType === AlertTypes.DEPOSIT);
    this.depositAlertSettingFormGroup.patchValue({
      encryptedCardId: alertObj?.cardId || this.SelectedCard?.value,
      entityId: alertObj?.entityId,
      isPaused: !alertObj ? false : !alertObj?.isPaused,

      isSendEmail: true,
      isSendSMS: alertObj?.isSendSMS ? true : false,
      entityAlertSettingId: alertObj?.entityAlertSettingId,

      entityEmailId: alertObj?.entityEmailId,
      entityPhoneId: alertObj?.entityPhoneId ? alertObj?.entityPhoneId : null,

      minAccountBalance: alertObj?.minAccountBalance,
    });

    this.depositAlertSettingFormGroup.updateValueAndValidity();
  }

  private bindManualEntryAlert() {
    const alertObj = this.alertSettingList.find((o) => o.alertType === AlertTypes.MANUAL_ENTRY);

    this.manualEntryAlertSettingFormGroup.patchValue({
      encryptedCardId: alertObj?.cardId || this.SelectedCard?.value,
      entityId: alertObj?.entityId,
      isPaused: !alertObj ? false : !alertObj?.isPaused,

      isSendEmail: alertObj?.isSendEmail ? true : false,
      isSendSMS: alertObj?.isSendSMS ? true : false,

      entityAlertSettingId: alertObj?.entityAlertSettingId,

      entityEmailId: alertObj?.entityEmailId,
      entityPhoneId: alertObj?.entityPhoneId ? alertObj?.entityPhoneId : null,

      isManualEntryCharge: alertObj?.manualEntryCharge,
      fromDate: alertObj?.fromDate
        ? { fromDate: moment(alertObj?.fromDate), toDate: moment(alertObj?.fromDate) }
        : null,
      toDate: alertObj?.toDate ? { fromDate: moment(alertObj?.toDate), toDate: moment(alertObj?.toDate) } : null,
    });

    this.manualEntryAlertSettingFormGroup.updateValueAndValidity();
  }

  private bindRequestAlert() {
    const alertObj = this.alertSettingList.find((o) => o.alertType === AlertTypes.REQUEST);
    this.requestAlertSettingFormGroup.patchValue({
      encryptedCardId: alertObj?.cardId || this.SelectedCard?.value,
      entityId: alertObj?.entityId,
      isPaused: !alertObj ? false : !alertObj?.isPaused,

      isSendEmail: alertObj?.isSendEmail ? true : false,
      isSendSMS: alertObj?.isSendSMS ? true : false,

      entityAlertSettingId: alertObj?.entityAlertSettingId,
      maxLimit: alertObj?.transMaxLimit,
      entityEmailId: alertObj?.entityEmailId,
      entityPhoneId: alertObj?.entityPhoneId ? alertObj?.entityPhoneId : null,
    });

    this.requestAlertSettingFormGroup.updateValueAndValidity();
  }

  onSaveAlertSetting() {
    if (this.validateAllAlerts()) {
      return;
    }

    let apiValue: any = {};
    if (this.noCardsFound) {
      apiValue = {
        balanceAlert: this.balanceAlertComponent?.finalBalanceAlertValues(),
      };
    } else {
      apiValue = {
        transAlert: this.transactionAlertComponent?.finalTransactionAlertValues(),
        balanceAlert: this.balanceAlertComponent?.finalBalanceAlertValues(),
        manualAlert: this.manualEntryAlertComponent?.finalManualEntryApiValue(),
        requestAlert: this.requestAlertComponent?.finalTransactionAlertValues(),
        depositAlert: this.depositAlertComponent.finalBalanceAlertValues(),
      };
    }

    const isInvalid = this.checkForInvalidPage(apiValue);

    if (isInvalid) return;
    const loader = this.notification.initLoadingPopup();
    if (!this.noCardsFound) {
      loader.then((res) => {
        if (res.isConfirmed) {
          this.getAlertSettingList();
        }
      });
    }

    this.alertSettingAPI.save(apiValue).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (!apiValue.balanceAlert.isPaused && !apiValue.transAlert.isPaused && !apiValue.manualAlert.isPaused) {
          this.notification.displaySuccess(res);
          return;
        }

        const message = this.matbiaAlertSettingFormGroupService.getMessage(
          apiValue.balanceAlert?.isPaused,
          apiValue.transAlert?.isPaused,
          apiValue.manualAlert?.isPaused,
          apiValue.requestAlert?.isPaused
        );

        this.notification.displaySuccess(message);
      },
      (err) => {
        this.notification.hideLoader();
        this.notification.throwError(err.error);
      }
    );
  }

  validateAllAlerts() {
    if (
      this.transactionAlertSettingFormGroup.invalid ||
      this.balanceAlertSettingFormGroup.invalid ||
      this.depositAlertSettingFormGroup.invalid ||
      this.manualEntryAlertSettingFormGroup.invalid ||
      this.requestAlertSettingFormGroup.invalid
    ) {
      this.transactionAlertSettingFormGroup.markAllAsTouched();
      this.balanceAlertSettingFormGroup.markAllAsTouched();
      this.depositAlertSettingFormGroup.markAllAsTouched();
      this.manualEntryAlertSettingFormGroup.markAllAsTouched();
      this.requestAlertSettingFormGroup.markAllAsTouched();
      return true;
    }
    return false;
  }

  /** Check if any alert setting page is turned on without email or phone selected */
  checkForInvalidPage(apiValue: any) {
    this.emailPhoneRequiredTransaction = false;
    this.emailPhoneRequiredBalance = false;
    this.emailPhoneRequiredDeposit = false;
    this.emailPhoneRequiredManual = false;
    this.emailPhoneRequiredRequest = false;

    this.isSaveClicked = true;
    for (let key in apiValue) {
      if (!apiValue[key].isPaused && !apiValue[key].isSendSMS && !apiValue[key].isSendEmail) {
        if (key == 'transAlert') {
          this.emailPhoneRequiredTransaction = true;
          this.pageValidation.transaction = true;
        } else if (key == 'balanceAlert') {
          this.emailPhoneRequiredBalance = true;
          this.pageValidation.balance = true;
        } else if (key == 'depositAlert') {
          this.emailPhoneRequiredDeposit = true;
          this.pageValidation.deposit = true;
        } else if (key == 'manualAlert') {
          this.emailPhoneRequiredManual = true;
          this.pageValidation.manual = true;
        } else if (key == 'requestAlert') {
          this.emailPhoneRequiredRequest = true;
          this.pageValidation.request = true;
        }
      }
    }

    if (
      this.emailPhoneRequiredTransaction ||
      this.emailPhoneRequiredRequest ||
      this.emailPhoneRequiredManual ||
      this.emailPhoneRequiredBalance ||
      this.emailPhoneRequiredDeposit
    ) {
      this.disableSave = true;
      return true;
    }
    return false;
  }

  goToDashboard() {
    this.router.navigate(this.pageRoute.getDashboardRouterLink());
  }

  onUpdateValue(disable: boolean, pageName: pageName) {
    this.pageValidation[pageName] = disable;
    let foundInvalidPage = Object.values(this.pageValidation).some((value) => value) && this.isSaveClicked;

    this.disableSave = foundInvalidPage;
  }
}
