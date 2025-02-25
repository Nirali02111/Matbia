import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
  AfterContentInit,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { merge, Subscription } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import moment from 'moment';
import dayjs from 'dayjs';

import { TransactionStatus } from '@enum/Transaction';
import { CustomValidator } from '@commons/custom-validator';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { DonorAPIService } from '@services/API/donor-api.service';
import { CommonAPIMethodService } from '@services/API/common-api-method.service';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';

import {
  DepositPayload,
  DepositResponse,
  DonorTransactionAPIService,
} from '@services/API/donor-transaction-api.service';
import { ScheduleAPIService } from '@services/API/schedule-api.service';

import { TransactionRecurrenceObj } from 'src/app/models/common-api-model';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { AnalyticsService } from '@services/analytics.service';

interface PreviewItem {
  name: string;
  date: any;
  dateString: string;
  amount: any;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-recurring-deposit-popup',
  templateUrl: './recurring-deposit-popup.component.html',
  styleUrls: ['./recurring-deposit-popup.component.scss'],
  imports: [SharedModule, MatbiaSkeletonLoaderComponentComponent, AmountInputComponent, InputErrorComponent],
})
export class RecurringDepositPopupComponent implements OnInit, AfterContentInit, OnDestroy {
  isLoading = false;
  previewSubscription!: Subscription;
  isAccountListLoading = false;

  readonly MAX_RECURRING_DEPOSIT = 30;

  linkedAccountList: Array<BankAccount> = [];

  toMatbia: Array<{ id: number; label: string }> = [{ id: 1, label: 'Matbia' }];
  toMatbiaSelect = 1;

  previewListData: Array<PreviewItem> = [];

  isTransactionRecurrencesLoading = false;
  transactionRecurrences: Array<TransactionRecurrenceObj> = [];

  formGroup!: UntypedFormGroup;

  @Output() refresh = new EventEmitter();

  @Output() reopen = new EventEmitter();

  @Input() isThreshold = false;

  openInfo = false;
  @Input() isEditSchedule = false;
  @Input() scheduleId!: number;

  @Input() replenishAmount = null;
  @Input() triggerAmount = null;

  @Input() oldApiData!: DepositPayload | null;

  isAlwaysRecurring = false;

  daysList = moment.weekdays().map((value, id) => {
    return { id, value };
  });
  selectedDay = moment().isoWeekday();
  modalRef!: NgbModalRef;

  get AmountDigit() {
    return '10000000000';
  }

  get UserHandle() {
    return this.formGroup.get('userHandle');
  }

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }

  get Amount() {
    return this.formGroup.get('amount');
  }

  get TransDate() {
    return this.formGroup?.get('transDate');
  }

  get TriggerAmount() {
    return this.formGroup?.get('triggerAmount');
  }

  get SetMaxSwitch() {
    return this.formGroup?.get('setMaxSwitch');
  }

  get RecurringPayment() {
    return this.formGroup?.get('recurringPayment');
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

  get isWeekly() {
    return Number(this.Frequency?.value) === 2;
  }

  get isBiWeekly() {
    return Number(this.Frequency?.value) === 3;
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private notification: NotificationService,
    private localStorage: LocalStorageDataService,
    private commonDataService: CommonDataService,
    private commonAPI: CommonAPIMethodService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private panelPopupService: PanelPopupsService,
    private accountAPI: AccountAPIService,
    private donorAPI: DonorAPIService,
    private scheduleAPIService: ScheduleAPIService,
    private donorTransactionAPI: DonorTransactionAPIService,
    private analytics: AnalyticsService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.getAccountList();

    if (!this.isThreshold) {
      this.getRecurringOption();
    }

    if (this.isEditSchedule && !this.oldApiData) {
      this.getScheduleDetails();
    }

    this.displayPreviewChanges();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.previewSubscription) {
      this.previewSubscription.unsubscribe();
    }
  }

  closePopup() {
    if (this.modalRef) this.modalRef.close();
    this.activeModal.close();
  }

  selectedDayControl = new UntypedFormControl(moment().isoWeekday());

  isInvalidDate(date: dayjs.Dayjs) {
    return date.isBefore(dayjs().subtract(1, 'day'));
  }

  private initForm() {
    const username = this.localStorage.getLoginUserUserName();
    this.formGroup = this.matbiaFormGroupService.initAddFundFormGroup({
      isRecurring: false,
      isDonate: false,
      userHandle: username,
      amount: null,
      bankAccountId: null,
      transDate: '',
      transferNowAmount: null,
      isNotifyOnEmail: true,
      isNotifyOnSMS: false,
      recurringPayment: {
        count: null,
        amount: null,
        frequency: null,
        scheduleDate: null,
      },
    });

    if (this.isThreshold) {
      this.formGroup.addControl(
        'triggerAmount',
        this.fb.control(
          null,
          Validators.compose([
            Validators.required,
            CustomValidator.greaterThan(0.01, true, 'Starting amount is $0.01', true),
          ])
        )
      );

      this.formGroup.patchValue({
        amount: Number(this.replenishAmount),
        triggerAmount: Number(this.triggerAmount),
      });

      this.formGroup.updateValueAndValidity();
    }

    if (!this.isThreshold) {
      this.formGroup.addControl('setMaxSwitch', this.fb.control(false));

      this.RecurringCount?.setValidators(
        Validators.compose([Validators.required, CustomValidator.greaterThan(1, false, 'Count must be at least 2')])
      );

      this.Frequency?.setValidators(Validators.compose([Validators.required]));
      this.RecurringCount?.updateValueAndValidity();
      this.Frequency?.updateValueAndValidity();

      this.initAlwaysRecurringOption();
      this.initSetMaxValue();
    }

    this.formGroup.patchValue({
      transDate: {
        startDate: moment(new Date()),
        endDate: moment(new Date()),
      },
    });

    if (!this.isThreshold && this.oldApiData) {
      if (this.oldApiData.recurringPayment?.count === -1) {
        this.RecurringAlways?.patchValue(true);
        this.RecurringAlways?.updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
      }

      if (this.oldApiData.recurringPayment?.count !== -1) {
        this.RecurringCount?.patchValue(this.oldApiData.recurringPayment?.count);
        this.RecurringAlways?.updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
      }

      this.formGroup.patchValue({
        amount: this.oldApiData.recurringPayment?.amount,
        recurringPayment: {
          amount: this.oldApiData.recurringPayment?.amount,
          frequency: this.oldApiData.recurringPayment?.frequency,
        },
        transDate: {
          startDate: moment(new Date(this.oldApiData.recurringPayment?.scheduleDate as string)),
          endDate: moment(new Date(this.oldApiData.recurringPayment?.scheduleDate as string)),
        },
      });

      this.selectedDayControl.patchValue(
        moment(new Date(this.oldApiData.recurringPayment?.scheduleDate as string)).isoWeekday()
      );

      this.selectedDay = moment(new Date(this.oldApiData.recurringPayment?.scheduleDate as string)).isoWeekday();

      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    }

    this.formGroup.updateValueAndValidity();
  }

  private getScheduleDetails() {
    this.isLoading = true;
    this.scheduleAPIService.getScheduleCard(this.scheduleId).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.mainSchedule.repeatTimes === -1) {
          this.RecurringAlways?.patchValue(true);
          this.RecurringAlways?.updateValueAndValidity();
          this.formGroup.updateValueAndValidity();
        }

        if (res.mainSchedule.repeatTimes !== -1) {
          this.RecurringCount?.patchValue(res.mainSchedule.remaining);
          this.RecurringAlways?.updateValueAndValidity();
          this.formGroup.updateValueAndValidity();
        }

        this.formGroup.patchValue({
          amount: res.mainSchedule.amount,
          recurringPayment: {
            amount: res.mainSchedule.amount,
            frequency: res.mainSchedule.frequencyId,
          },
        });

        if (res.upcomingSchedules && res.upcomingSchedules.length !== 0) {
          this.formGroup.patchValue({
            transDate: {
              startDate: moment(new Date(res.upcomingSchedules[0].scheduleDateTime)),
              endDate: moment(new Date(res.upcomingSchedules[0].scheduleDateTime)),
            },
          });
          const dayIn = moment(new Date(res.upcomingSchedules[0].scheduleDateTime)).isoWeekday();
          this.selectedDayControl.patchValue(dayIn);
          this.selectedDay = dayIn;
        }

        this.formGroup.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private getAccountList() {
    this.isAccountListLoading = true;
    this.accountAPI.getBankAccounts(this.UserHandle?.value).subscribe(
      (res) => {
        this.isAccountListLoading = false;
        if (res && res.data.length !== 0) {
          this.linkedAccountList = res.data;

          this.BankAccountId?.clearValidators();
          this.BankAccountId?.setValidators(
            Validators.compose([Validators.required, CustomValidator.bankAccountInactive(this.linkedAccountList)])
          );

          if (res.firstAccount && res.firstAccount.bankAccountId) {
            this.BankAccountId?.patchValue(res.firstAccount.bankAccountId);
            this.BankAccountId?.markAsTouched();
          }
        }

        this.formGroup.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
      },
      () => {
        this.isAccountListLoading = false;
      }
    );
  }

  private getRecurringOption() {
    this.isTransactionRecurrencesLoading = true;
    this.commonAPI.getTransactionRecurrence().subscribe((res) => {
      this.isTransactionRecurrencesLoading = false;
      this.transactionRecurrences = res.filter((o) => {
        return !(o.id === 6 || o.id === 7);
      });
    });
  }

  private initAlwaysRecurringOption() {
    // check always recurring
    this.RecurringAlways?.valueChanges.subscribe((val) => {
      if (val) {
        this.isAlwaysRecurring = true;
        this.RecurringCount?.clearValidators();
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

  private initSetMaxValue() {
    // check always recurring
    this.SetMaxSwitch?.valueChanges.subscribe((val) => {
      if (val) {
        this.RecurringCount?.patchValue(this.MAX_RECURRING_DEPOSIT);
        this.RecurringCount?.updateValueAndValidity();
      } else {
        this.RecurringCount?.patchValue(null);
        this.RecurringCount?.updateValueAndValidity();
      }
    });
  }

  displaySelectedDay() {
    return this.daysList.find((o) => {
      return o.id === this.selectedDay;
    })?.value;
  }

  togglePreviewPanel() {
    this.openInfo = !this.openInfo;
  }

  onSaveThreshold() {
    if (this.Amount?.invalid || this.TriggerAmount?.invalid) {
      return;
    }

    const userId = this.localStorage.getLoginUserId();
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.refresh.emit(true);
        return;
      }
    });
    this.closePopup();
    this.donorAPI
      .saveAutoReplenish({
        userHandle: this.UserHandle?.value,
        triggerAmount: this.TriggerAmount?.value,
        replenishAmount: this.Amount?.value,
        isActive: true,
        createdBy: userId || 0,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.hideLoader();
          this.notification.displayError(err.error);
        }
      );
  }

  private getValues() {
    const apiData = this.formGroup.value;

    return {
      ...apiData,
      transDate: null,
      amount: +apiData.amount,
      createdBy: +this.localStorage.getLoginUserId(),
      recurringPayment: {
        ...apiData.recurringPayment,
        count: apiData.recurringPayment.alwaysRecurring ? -1 : +apiData.recurringPayment?.count,
        scheduleDate: apiData.transDate?.startDate,
        amount: +apiData.amount,
      },
    };
  }

  onSave() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        return;
      }
    });

    this.doSaveSchedule();
  }

  onUpdateSchedule() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const modelRef = this.panelPopupService.openEditScheduleConfirmPopup();

    modelRef.componentInstance.confirm.subscribe((val: boolean) => {
      if (!val) {
        return;
      }

      const loader = this.notification.initLoadingPopup();
      loader.then((loaderRes) => {
        if (loaderRes.isConfirmed) {
          return;
        }
      });

      this.closePopup();

      const apiData = this.getValues();

      this.scheduleAPIService
        .cancel({
          scheduleId: this.scheduleId,
          sendCancellationEmail: false,
        })
        .pipe(
          map((data) => data),
          switchMap(() => {
            return this.donorTransactionAPI.deposit({
              ...apiData,
            });
          })
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.checkDepositResponse(apiData, response);
          },
          (err) => {
            this.displayDepositError(err, apiData);
          }
        );
    });
  }

  private doSaveSchedule() {
    const apiData = this.getValues();

    this.closePopup();
    this.donorTransactionAPI
      .deposit({
        ...apiData,
      })
      .subscribe(
        (res) => {
          this.checkDepositResponse(apiData, res);
        },
        (err) => {
          this.displayDepositError(err, apiData);
        }
      );
  }

  private checkDepositResponse(apiData: any, res: DepositResponse) {
    this.notification.hideLoader();
    this.notification.close();
    this.analytics.initAddFundsEvent();
    const modelRef = this.panelPopupService.openAfterTransactionPopup();
    modelRef.componentInstance.amount = this.Amount?.value;
    modelRef.componentInstance.bankAccount = this.linkedAccountList.find(
      (o) => o.bankAccountId === this.BankAccountId?.value
    );

    modelRef.componentInstance.status = res.status;
    // Do first check it's schedule or not
    if (res.status === TransactionStatus.SCHEDULED) {
      this.refresh.emit(true);
      modelRef.componentInstance.isSuccess = true;
      modelRef.componentInstance.depositAvailable = res.depositAvailable;
      modelRef.componentInstance.dbTransId = res.encryptedDbTransId;
      modelRef.componentInstance.frequency = this.transactionRecurrences.find(
        (o) => o.id === apiData.recurringPayment?.frequency
      )?.name;
      return;
    }

    if (!res.gatewayResponse) {
      modelRef.componentInstance.isSuccess = false;
      modelRef.componentInstance.errorMessage = res.status;
      return;
    }

    if (res.gatewayResponse?.errors.length !== 0) {
      modelRef.componentInstance.isSuccess = false;
      modelRef.componentInstance.errorMessage = res.gatewayResponse?.errors[0].error;

      if (res?.error && res?.error.length !== 0) {
        modelRef.componentInstance.errorMessageFromServer = res?.error[0].error;
      }
      return;
    }

    if (res.error) {
      modelRef.componentInstance.isSuccess = false;
      modelRef.componentInstance.errorMessageFromServer = res?.error[0].error;
      return;
    }

    this.refresh.emit(true);

    modelRef.componentInstance.isSuccess = true;
    modelRef.componentInstance.dbTransId = res.encryptedDbTransId;
    modelRef.componentInstance.depositAvailable = res.depositAvailable;
  }

  private displayDepositError(err: any, apiData: any) {
    this.notification.hideLoader();
    this.notification.close();
    const modelRef = this.panelPopupService.openAfterTransactionPopup();
    modelRef.componentInstance.amount = this.Amount?.value;
    modelRef.componentInstance.bankAccount = this.linkedAccountList.find(
      (o) => o.bankAccountId === this.BankAccountId?.value
    );
    modelRef.componentInstance.isSuccess = false;
    modelRef.componentInstance.errorMessage = err.error;
    modelRef.closed.subscribe(() => {
      if (apiData) {
        this.reopen.emit(apiData);
      }
    });
  }

  /**
   * Get First week Day Based on date selection
   * @returns
   */
  private getWeekDay() {
    const dayINeed = +this.selectedDay;
    const today = moment(this.TransDate?.value.startDate.toDate()).isoWeekday();

    /**
     * return from next week
     */
    if (today <= dayINeed) {
      return moment(this.TransDate?.value.startDate.toDate()).isoWeekday(dayINeed);
    } else {
      return moment(this.TransDate?.value.startDate.toDate()).add(1, 'weeks').isoWeekday(dayINeed);
    }
  }

  /**
   * Get current week date based on selected dropdown day
   * @returns
   */
  private getDateFromDropdownSelect() {
    const today = moment().isoWeekday();

    if (today < this.selectedDay) {
      return moment().isoWeekday(this.selectedDay);
    } else {
      return moment().add(1, 'weeks').isoWeekday(this.selectedDay);
    }
  }

  /**
   * On Change weekly day update Transaction date based on selected value
   * @param val Number
   */
  changeSelected(val: any) {
    this.selectedDay = val;
    this.selectedDayControl.patchValue(val);

    const date = this.getDateFromDropdownSelect();

    this.formGroup.patchValue({
      transDate: {
        startDate: date.startOf('day'),
        endDate: date.endOf('day'),
      },
    });

    this.formGroup.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * On Date update from UI update selected Day value in Dropdown
   * @param value
   * @returns
   */
  datesUpdated(value: any) {
    if (!value.startDate) {
      return;
    }

    const weekDay = value.startDate.isoWeekday();

    this.selectedDay = weekDay === 7 ? 0 : weekDay;
    this.selectedDayControl.patchValue(this.selectedDay);
  }

  displayPreviewChanges() {
    if (
      this.Amount?.valueChanges &&
      this.RecurringCount?.valueChanges &&
      this.Frequency?.valueChanges &&
      this.TransDate?.valueChanges
    ) {
      this.previewSubscription = merge(
        this.selectedDayControl.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.Amount?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.Frequency.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.TransDate.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.RecurringCount.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      ).subscribe(() => {
        const data = [];

        if (this.Amount?.value && this.Frequency?.value && this.TransDate?.value && this.RecurringCount?.value) {
          /**
           * check for weekly
           */
          const initialDate = this.isWeekly || this.isBiWeekly ? this.getWeekDay() : this.TransDate?.value.endDate;

          const previewLength = this.toDisplayMaxPreview();

          for (let index = 0; index < previewLength; index++) {
            const d = this.createPreviewRow(initialDate, index);
            data.push({
              ...d,
            });
          }
        }

        this.previewListData = data;
      });
    }
  }

  toDisplayMaxPreview(): number {
    if (this.RecurringAlways?.value) {
      return this.MAX_RECURRING_DEPOSIT;
    }

    if (this.RecurringCount?.value && this.RecurringCount?.value <= this.MAX_RECURRING_DEPOSIT) {
      return this.RecurringCount?.value;
    }

    return this.MAX_RECURRING_DEPOSIT;
  }

  createPreviewRow(firstDate: moment.Moment, index: number) {
    const date = this.commonDataService.getPreviewDate(firstDate.toDate(), index, this.Frequency?.value);

    return {
      name: '',
      date,
      dateString: date.format('MMM. D YYYY'),
      amount: this.Amount?.value,
    };
  }

  schedulePreview(schedulePreviewTmp: TemplateRef<any>) {
    this.modalRef = this.modalService.open(schedulePreviewTmp, {
      centered: true,
      keyboard: false,
      windowClass: 'modal-preview',
      size: 'md',
      scrollable: true,
      fullscreen: 'md',
    });
  }

  backToRecurreingPopup() {
    this.modalRef.close();
  }
}
