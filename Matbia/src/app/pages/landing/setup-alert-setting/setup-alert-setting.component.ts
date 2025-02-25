import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import moment from 'moment';
import { AlertTypes } from '@enum/Alert';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { TransactionAlertFormGroupComponent } from '@matbia/matbia-alert-setting/transaction-alert-form-group/transaction-alert-form-group.component';
import { BalanceAlertFormGroupComponent } from '@matbia/matbia-alert-setting/balance-alert-form-group/balance-alert-form-group.component';
import { ManualEntryAlertFormGroupComponent } from '@matbia/matbia-alert-setting/manual-entry-alert-form-group/manual-entry-alert-form-group.component';
import { MatbiaAlertSettingFormGroupService } from '@matbia/matbia-alert-setting/matbia-alert-setting-form-group.service';

import { AlertSettingAPIService, AlertSettingObj } from '@services/API/alert-setting-api.service';
import { MatbiaCardObj, MatbiaCardSettingService } from '@services/API/matbia-card-setting.service';

import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-setup-alert-setting',
  templateUrl: './setup-alert-setting.component.html',
  styleUrls: ['./setup-alert-setting.component.scss'],
  imports: [
    SharedModule,
    BalanceAlertFormGroupComponent,
    DisplayLastPipe,
    TransactionAlertFormGroupComponent,
    ManualEntryAlertFormGroupComponent,
    MatbiaSkeletonLoaderComponentComponent,
    ButtonLoaderComponent,
  ],
})
export class SetupAlertSettingComponent implements OnInit {
  isLoading = false;
  isLoadingCards = false;

  activeId = '';

  listCards: Array<MatbiaCardObj> = [];
  alertSettingList: Array<AlertSettingObj> = [];

  emailList: Array<EmailEntityObj> = [];
  phoneList: Array<PhoneEntityObj> = [];

  cardListFilterFormGroup!: UntypedFormGroup;

  transactionAlertSettingFormGroup!: UntypedFormGroup;
  balanceAlertSettingFormGroup!: UntypedFormGroup;
  manualEntryAlertSettingFormGroup!: UntypedFormGroup;
  requestAlertSettingFormGroup!: UntypedFormGroup;

  @ViewChild(TransactionAlertFormGroupComponent) transactionAlertComponent!: TransactionAlertFormGroupComponent;
  @ViewChild(BalanceAlertFormGroupComponent) balanceAlertComponent!: BalanceAlertFormGroupComponent;
  @ViewChild(ManualEntryAlertFormGroupComponent) manualEntryAlertComponent!: ManualEntryAlertFormGroupComponent;
  @ViewChild('requestAlert') requestAlertComponent!: TransactionAlertFormGroupComponent;

  get SelectedCard() {
    return this.cardListFilterFormGroup.get('selectedCard');
  }

  constructor(
    protected title: Title,
    private router: Router,
    private fb: UntypedFormBuilder,
    private localStorage: LocalStorageDataService,
    private notification: NotificationService,
    private alertSettingAPI: AlertSettingAPIService,
    private matbiaCardSettingAPI: MatbiaCardSettingService,
    private matbiaAlertSettingFormGroupService: MatbiaAlertSettingFormGroupService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Alerts');
    this.cardListFilterFormGroup = this.fb.group({
      selectedCard: this.fb.control(null),
    });

    this.initForm();

    this.getCardList();

    this.SelectedCard?.valueChanges.subscribe((val) => {
      if (val) {
        this.getAlertSettingList();
      }
    });
  }

  goToDashboard() {
    this.router.navigate([PageRouteVariable.DashboardUrl]);
  }

  private initForm() {
    this.transactionAlertSettingFormGroup =
      this.matbiaAlertSettingFormGroupService.initTransactionAlertSettingFormGroup();
    this.balanceAlertSettingFormGroup = this.matbiaAlertSettingFormGroupService.initBalanceAlertSettingFormGroup();
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
        this.isLoadingCards = false;
        if (res) {
          this.listCards = res.filter((o) => {
            return o.statusID !== -1;
          });

          const firstCard = this.getFirstOrSelectedCard();
          this.activeId = firstCard.cardId;
          this.onNavChange({ nextId: firstCard.cardId });

          return;
        }

        this.activeId = 'no-card';
      },
      () => {
        this.isLoadingCards = false;
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
    if (this.transactionAlertSettingFormGroup.invalid) {
      this.transactionAlertSettingFormGroup.markAllAsTouched();
      return;
    }

    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.goToDashboard();
      }
    });

    const apiValue = {
      transAlert: this.transactionAlertComponent.finalTransactionAlertValues(),
      balanceAlert: this.balanceAlertComponent.finalBalanceAlertValues(),
      manualAlert: this.manualEntryAlertComponent.finalManualEntryApiValue(),
      requestAlert: this.requestAlertComponent.finalTransactionAlertValues(),
    };

    this.alertSettingAPI.save(apiValue).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (!apiValue.balanceAlert.isPaused && !apiValue.transAlert.isPaused && !apiValue.manualAlert.isPaused) {
          this.notification.displaySuccess(res);
          return;
        }

        const message = this.matbiaAlertSettingFormGroupService.getMessage(
          apiValue.balanceAlert.isPaused,
          apiValue.transAlert.isPaused,
          apiValue.manualAlert.isPaused,
          apiValue.requestAlert.isPaused
        );

        this.notification.displaySuccess(message);
      },
      (err) => {
        this.notification.hideLoader();
        this.notification.throwError(err.error);
      }
    );
  }
}
