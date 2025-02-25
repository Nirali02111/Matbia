import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterContentInit, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import dayjs from 'dayjs';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import {
  BatchPayload,
  OrganizationTransactionAPIService,
  ScheduleRedeemPayload,
} from '@services/API/organization-transaction-api.service';
import { NotificationService } from '@commons/notification.service';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { OrgBalanceResponse, OrganizationAPIService } from '@services/API/organization-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { CustomValidator } from '@commons/custom-validator';
import { shakeTrigger } from '@commons/animations';
import { ScheduleAPIService } from '@services/API/schedule-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-batch-close-view',
  templateUrl: './batch-close-view.component.html',
  imports: [SharedModule, MatbiaSkeletonLoaderComponentComponent, AmountInputComponent, InputErrorComponent],
  animations: [shakeTrigger],
})
export class BatchCloseViewComponent implements OnInit, AfterContentInit {
  isLoading = signal<boolean>(false);
  inAnimation = false;
  isAccountListLoading = false;
  isAlwaysRecurring = false;
  formGroup!: FormGroup;

  orgBalance!: OrgBalanceResponse & { availableToRedeem?: number };
  linkedAccountList: Array<BankAccount & { disabled?: boolean }> = [];

  maxDate: dayjs.Dayjs = dayjs().add(30, 'days');
  minDate: dayjs.Dayjs = dayjs();

  get RecurringPayment() {
    return this.formGroup.get('recurringPayment');
  }

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }

  get IsPaused() {
    return this.RecurringPayment?.get('isPaused');
  }

  get Frequency() {
    return this.RecurringPayment?.get('frequency');
  }

  get RecurringCount() {
    return this.RecurringPayment?.get('count');
  }

  get RecurringAlways() {
    return this.RecurringPayment?.get('alwaysRecurring');
  }

  get EnterAmount() {
    return this.RecurringPayment?.get('amount');
  }

  get SelectedDay() {
    return this.RecurringPayment?.get('selectedDay');
  }

  get ScheduleDate() {
    return this.RecurringPayment?.get('scheduleDate');
  }

  get isDaily() {
    return this.Frequency?.value === '1';
  }

  get isWeekly() {
    return this.Frequency?.value === '2';
  }

  get isMonthly() {
    return this.Frequency?.value === '4';
  }

  get isThreshold() {
    return this.Frequency?.value === '7';
  }

  get isPaused() {
    return this.IsPaused?.value;
  }

  daysList = moment.weekdays().map((value: any, id: any) => {
    return { id, value };
  });

  @ViewChild('manuallyBatchContentModal', { static: true }) manuallyBatchContentModal: any;

  store = effect(() => {
    if (!this.isLoading() && this.popupService.getService().hasOpenModals()) {
      this.popupService.getService().dismissAll();
      this.openCloseCurrentBatchPopup();
    }
  });

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageDataService,
    private notification: NotificationService,
    private pageRoute: PageRouteVariable,
    private popupService: PanelPopupsService,
    private accountAPI: AccountAPIService,
    private organizationAPI: OrganizationAPIService,
    private organizationTransactionAPI: OrganizationTransactionAPIService,
    private scheduleAPI: ScheduleAPIService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.getBalance();
    this.getBankAccountList();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  isInvalidDate(date: dayjs.Dayjs) {
    return date.isBefore(dayjs().subtract(1, 'day'));
  }
  displayDay() {
    const obj = this.daysList.find((o: any) => o.id === this.SelectedDay?.value);
    return obj?.value || '';
  }

  private triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  private initForm() {
    this.formGroup = this.fb.group({
      recurringPayment: this.fb.group({
        frequency: this.fb.control('7', Validators.compose([Validators.required])),
        amount: this.fb.control(
          null,
          Validators.compose([CustomValidator.greaterThan(100, true, 'Amount should be more then $100', true)])
        ),
        count: this.fb.control(
          null,
          Validators.compose([Validators.required, CustomValidator.greaterThan(1, false, 'Count must be at least 2')])
        ),
        isPaused: this.fb.control(false),
        alwaysRecurring: this.fb.control(false),

        selectedDay: this.fb.control(null),
        scheduleDate: this.fb.control(null),
      }),

      bankAccountId: this.fb.control(null),
    });

    this.Frequency?.valueChanges.subscribe(() => {
      if (this.isThreshold) {
        this.EnterAmount?.enable();

        this.formGroup.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
        return;
      }

      this.formGroup.patchValue({
        amount: null,
      });

      this.EnterAmount?.disable();

      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });

    this.RecurringAlways?.valueChanges.subscribe((val) => {
      if (val) {
        this.EnterAmount?.enable();

        this.formGroup.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
        return;
      }

      this.formGroup.patchValue({
        amount: null,
      });

      this.EnterAmount?.disable();

      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });

    this.IsPaused?.valueChanges.subscribe((val) => {
      if (!val) {
        this.switchOffAction();
      }
    });

    this.initAlwaysRecurringOption();
  }

  private initAlwaysRecurringOption() {
    // check always recurring
    this.RecurringAlways?.valueChanges.subscribe((val) => {
      if (val) {
        this.isAlwaysRecurring = true;
        this.RecurringCount?.setValue(-1);
        this.RecurringCount?.updateValueAndValidity();
        this.RecurringPayment?.updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
      } else {
        this.isAlwaysRecurring = false;
        this.RecurringCount?.setValidators(
          Validators.compose([Validators.required, CustomValidator.greaterThan(1, false, 'Count must be at least 2')])
        );
        this.RecurringCount?.updateValueAndValidity();
        this.RecurringPayment?.updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
      }
    });
  }

  private getBalance() {
    this.isLoading.update((val) => !val);
    this.organizationAPI.getBalance().subscribe(
      (res) => {
        this.isLoading.update((val) => !val);
        if (res) {
          this.orgBalance = res;

          if (this.orgBalance && this.orgBalance.scheduleId) {
            this.IsPaused?.patchValue(true);
            this.Frequency?.patchValue(this.orgBalance.recurrenceId ? this.orgBalance.recurrenceId.toString() : null);
            this.RecurringCount?.patchValue(this.orgBalance.openSchedules ? this.orgBalance.openSchedules : null);
            if (this.orgBalance.openSchedules == -1) {
              this.isAlwaysRecurring = true;
            }

            if (this.orgBalance.scheduleDateTime) {
              const valV = moment(this.orgBalance.scheduleDateTime).day();

              this.SelectedDay?.patchValue(valV);

              this.ScheduleDate?.patchValue({
                startDate: moment(this.orgBalance.scheduleDateTime),
                endDate: moment(this.orgBalance.scheduleDateTime),
              });
            }
          }

          if (this.orgBalance && this.orgBalance.autoRedeemAmount) {
            this.IsPaused?.patchValue(true);
            this.EnterAmount?.patchValue(this.orgBalance.autoRedeemAmount);
            this.Frequency?.patchValue('7');
          }

          this.formGroup.updateValueAndValidity();
          this.changeDetectorRef.detectChanges();
        }
      },
      () => {
        this.isLoading.update((val) => !val);
      }
    );
  }

  private getBankAccountList() {
    this.isAccountListLoading = true;

    const userHandle = this.localStorageService.getLoginUserUserName();

    this.accountAPI.getBankAccounts(userHandle).subscribe(
      (res) => {
        this.isAccountListLoading = false;
        if (res && res.data && res.data.length !== 0) {
          this.linkedAccountList = res.data.map((o) => ({ ...o, disabled: false }));
          if (res.data.length === 1) {
            const primaryAccount = res.data[0];
            this.BankAccountId?.patchValue(primaryAccount.bankAccountId);
          }

          if (res.data.length > 1) {
            const findDefaultAccount = this.linkedAccountList.find((o) => !!o.isDefault);
            if (findDefaultAccount) {
              this.BankAccountId?.patchValue(findDefaultAccount.bankAccountId);
            } else {
              const anyElse = res.data[0];
              this.BankAccountId?.patchValue(anyElse.bankAccountId);
            }
          }
        }
      },
      () => {
        this.isAccountListLoading = false;
      }
    );
  }

  private switchOffAction() {
    const modalRef = this.popupService.openEditScheduleConfirmPopup();
    modalRef.componentInstance.isDelete = true;
    modalRef.componentInstance.confirm.subscribe((val: boolean) => {
      if (val && this.orgBalance.scheduleId) {
        const loader = this.notification.initLoadingPopup();
        loader.then((res) => {
          if (res.isConfirmed) {
            this.router.navigate(this.pageRoute.getBatchesRouterLink());
            return;
          }
        });

        this.scheduleAPI
          .cancel({
            scheduleId: this.orgBalance.scheduleId,
            sendCancellationEmail: false,
          })
          .subscribe(
            (res) => {
              this.notification.hideLoader();
              this.notification.displaySuccess(res);
            },
            (err) => {
              this.notification.throwError(err.error);
            }
          );
      }
    });
  }

  onOpenManuallyBatch(event: Event) {
    event.preventDefault();

    if (this.isLoading()) {
      this.openPopUp();
      return;
    }

    if (!this.orgBalance.hasRedeem) {
      this.openCloseCurrentBatchPopup();
      return;
    }

    this.openPopUp();
  }

  private openPopUp() {
    this.popupService.open(this.manuallyBatchContentModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-batch-close',
      size: 'md',
      scrollable: true,
    });
  }

  openCloseCurrentBatchPopup() {
    const modalRef = this.popupService.openCloseCurrentBatchPopup();

    modalRef.componentInstance.orgBalance = this.orgBalance;
    modalRef.componentInstance.linkedAccountList = this.linkedAccountList;

    modalRef.componentInstance.doBatch.subscribe((payload: BatchPayload) => {
      const accoNum = modalRef.componentInstance.linkedAccountList.filter(
        (x: BankAccount) => x.bankAccountId == payload.bankAccountId
      );

      const amount = modalRef.componentInstance.NetAmount;

      this.doBatch(payload, { accoNum, amount });
    });
  }

  doBatch(payload: BatchPayload, infoData: { accoNum: Array<BankAccount>; amount: number }) {
    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        return;
      }
    });

    this.organizationTransactionAPI.batch(payload).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res.error[0].error);
          return;
        }

        this.notification.close();

        const modalRef = this.popupService.openAfterRedeemDonationPopup();
        modalRef.componentInstance.accoNum = infoData.accoNum && infoData.accoNum[0].accountNumber;
        modalRef.componentInstance.amount = infoData.amount;
        modalRef.componentInstance.isBatch = true;
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  private getWeekDay() {
    const dayINeed = +this.SelectedDay?.value;
    const today = moment().isoWeekday();

    /**
     * check if selected date available in this week otherwise from next week
     */
    if (today < dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }

  private scheduleRedeemAPI(): ScheduleRedeemPayload {
    const validRedeemAmount = +this.EnterAmount?.value < 100 ? 100 : +this.EnterAmount?.value;

    const { alwaysRecurring, isPaused, ...resetRecurringPayment } = this.RecurringPayment?.value;

    if (this.isWeekly) {
      return {
        recurringPayment: {
          ...resetRecurringPayment,
          amount: validRedeemAmount,
          frequency: +this.Frequency?.value,
          scheduleDate: this.getWeekDay(),

          selectedDay: this.displayDay(),
        },
        bankAccountId: this.BankAccountId?.value,
      };
    }

    if (this.isMonthly) {
      return {
        recurringPayment: {
          ...resetRecurringPayment,
          frequency: +this.Frequency?.value,
          amount: validRedeemAmount,
          scheduleDate: !this.ScheduleDate?.value ? moment() : this.ScheduleDate?.value.startDate,
        },

        bankAccountId: this.BankAccountId?.value,
      };
    }

    return {
      recurringPayment: {
        ...resetRecurringPayment,
        frequency: +this.Frequency?.value,
        amount: validRedeemAmount,
        scheduleDate: !this.ScheduleDate?.value ? moment() : this.ScheduleDate?.value.startDate,
      },
      bankAccountId: this.BankAccountId?.value,
    };
  }

  private getMessage() {
    const msg = `auto batch has been created`;
    if (this.isDaily) {
      return `Daily ${msg}`;
    }

    if (this.isWeekly) {
      return `Weekly ${msg}`;
    }

    return `Monthly ${msg}`;
  }

  onSave() {
    if (this.isThreshold) {
      if (this.EnterAmount?.invalid) {
        this.formGroup.markAllAsTouched();
        return;
      }

      this.saveAutoRedeem();
      return;
    }

    if (this.formGroup.invalid) {
      this.triggerAnimation();
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.isWeekly && this.SelectedDay?.value === null) {
      this.triggerAnimation();
      this.formGroup.markAllAsTouched();
      return;
    }

    if ((this.isMonthly || this.isDaily) && !this.ScheduleDate?.value) {
      this.triggerAnimation();
      this.formGroup.markAllAsTouched();
      return;
    }

    this.doScheduleRedeem();
  }

  private saveAutoRedeem() {
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getBatchesRouterLink());
        return;
      }
    });

    this.organizationAPI
      .saveOrganizationAutoRedeem({
        triggerAmount: this.EnterAmount?.value,
        isStopRequest: false,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  private doScheduleRedeem() {
    const apiData = this.scheduleRedeemAPI();

    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getBatchesRouterLink());
        return;
      }
    });

    this.organizationTransactionAPI.scheduleRedeem(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res.error[0].error);
          return;
        }

        const title = this.getMessage();
        this.notification.displaySuccess(title);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }
}
