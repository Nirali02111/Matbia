import { Input, OnInit, OnDestroy, ViewChild, Component, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { merge, Subscription } from 'rxjs';
import moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import dayjs from 'dayjs';
import { CustomValidator } from '@commons/custom-validator';
import { CommonAPIMethodService } from '@services/API/common-api-method.service';
import { TransactionRecurrenceObj } from 'src/app/models/common-api-model';
import { CommonDataService } from '@commons/common-data-service.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { TransactionNoteFormGroupComponent } from '../transaction-note-form-group/transaction-note-form-group.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-recurring-form-group',
  templateUrl: './recurring-form-group.component.html',
  styleUrls: ['./recurring-form-group.component.scss'],
  imports: [SharedModule, TransactionNoteFormGroupComponent, InputErrorComponent],
})
export class RecurringFormGroupComponent implements OnInit, AfterContentInit, OnDestroy {
  isTransactionRecurrencesLoading = false;

  subscription!: Subscription;
  priviewSubscription!: Subscription;
  @ViewChild('previewScheduleContentModal') previewScheduleContentModal: any;
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;

  public previewList: Array<{ date: any; amount: any; dateString: string }> = [];

  public previewListLast: Array<{ date: any; amount: any; dateString: string }> = [];

  daysList = moment.weekdays().map((value, id) => {
    return { id, value };
  });

  @Input() transactionRecurrences: Array<TransactionRecurrenceObj> = [];

  @Input() formGroup!: UntypedFormGroup;

  @Input() noteMessage = true;

  @Input() enableTransferNow = false;

  @Input() showAlwaysRecurringOption = true;

  /**
   *
   * for display custom layout other then regular layout
   *
   */
  @Input() customLayout = false;

  transferNowFormGroup!: UntypedFormGroup;

  get IsDonate() {
    return this.formGroup.get('isDonate');
  }

  get Recurring() {
    return this.formGroup.get('isRecurring');
  }

  get Amount() {
    return this.formGroup.get('amount');
  }

  get TransDate() {
    return this.formGroup.get('transDate');
  }

  get TransferNowAmount() {
    return this.formGroup.get('transferNowAmount');
  }

  get IsNotifyOnEmail() {
    return this.formGroup.get('isNotifyOnEmail');
  }

  get IsNotifyOnSMS() {
    return this.formGroup.get('isNotifyOnSMS');
  }

  get RecurringPayment() {
    return this.formGroup.get('recurringPayment');
  }

  get RecurringCount() {
    return this.RecurringPayment?.get('count');
  }

  get RecurringAmount() {
    return this.RecurringPayment?.get('amount');
  }

  get RecurringFrequency() {
    return this.RecurringPayment?.get('frequency');
  }

  get RecurringAlways() {
    return this.RecurringPayment?.get('alwaysRecurring');
  }

  get CounterPlaceholder() {
    return this.RecurringAlways?.value ? 'Always' : '';
  }

  get isWeeklyOrBiWeekly() {
    return this.RecurringFrequency?.value === 2 || this.RecurringFrequency?.value === 3;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private commonAPI: CommonAPIMethodService,
    private commonDataService: CommonDataService,
    private modalService: NgbModal
  ) {}

  displayTotal() {
    const amount = this.RecurringAmount?.value ? Number(this.RecurringAmount?.value) : 0;
    const count = this.RecurringCount?.value ? Number(this.RecurringCount?.value) : 0;
    return amount * count;
  }

  private calculate() {
    const amount = this.Amount?.value ? Number(this.Amount?.value) : 0;
    const count = this.RecurringCount?.value ? Number(this.RecurringCount?.value) : 0;
    if (count === 0) {
      return 0;
    }
    // return amount / count;
    return amount;
  }

  ngOnInit(): void {
    this.initTransferNow();

    this.initRecurringOption();

    this.scheduleAmountCalculation();
    this.displayPreviewChanges();

    this.setDefaultTransactionDate();

    if (!this.customLayout) {
      this.initAlwaysRecurringOption();

      this.RecurringCount?.valueChanges.pipe(distinctUntilChanged()).subscribe((val) => {
        if (!val) {
          this.RecurringPayment?.updateValueAndValidity();
          this.formGroup.updateValueAndValidity();
          return;
        }

        this.RecurringPayment?.updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
      });
    }
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
    if (this.pickerDirective) {
      this.pickerDirective.ref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.priviewSubscription.unsubscribe();
  }

  isInvalidDate(date: dayjs.Dayjs) {
    return date.isBefore(dayjs().subtract(1, 'day'));
  }

  setDefaultTransactionDate() {
    if (this.TransDate?.value) {
      this.formGroup.patchValue({
        transDate: {
          startDate: this.TransDate?.value,
          endDate: this.TransDate?.value,
        },
      });
    }

    if (!this.TransDate?.value) {
      this.formGroup.patchValue({
        transDate: {
          startDate: moment(new Date()),
          endDate: moment(new Date()),
        },
      });
    }

    this.formGroup.updateValueAndValidity();
  }

  private initTransferNow() {
    this.transferNowFormGroup = this.fb.group({
      isTransferNow: this.fb.control(false),
    });

    this.transferNowFormGroup.get('isTransferNow')?.valueChanges.subscribe((val) => {
      if (val) {
        this.TransferNowAmount?.setValidators(Validators.compose([Validators.required]));
      } else {
        this.TransferNowAmount?.clearValidators();
      }

      this.TransferNowAmount?.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });
  }

  private initRecurringOption() {
    this.Recurring?.valueChanges.subscribe((val) => {
      if (val) {
        this.enableRecurringOptions();
      } else {
        this.disableRecurringOptions();
      }

      this.RecurringCount?.updateValueAndValidity();
      this.RecurringAmount?.updateValueAndValidity();
      this.RecurringFrequency?.updateValueAndValidity();
      this.RecurringPayment?.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });
  }

  private initAlwaysRecurringOption() {
    // check always recurring
    this.RecurringAlways?.valueChanges.subscribe((val) => {
      if (val) {
        this.enableAlwaysRecurring();
      } else {
        this.disableAlwaysRecurringOptions();
      }
    });
  }

  private enableRecurringOptions() {
    this.RecurringCount?.setValidators(
      Validators.compose([Validators.required, CustomValidator.greaterThan(1, false, 'Count must be at least 2')])
    );
    this.RecurringAmount?.setValidators(Validators.compose([Validators.required]));
    this.RecurringFrequency?.setValidators(Validators.compose([Validators.required]));

    if (!this.transactionRecurrences || this.transactionRecurrences.length === 0) {
      this.isTransactionRecurrencesLoading = true;
      this.commonAPI.getTransactionRecurrence().subscribe(
        (res) => {
          this.isTransactionRecurrencesLoading = false;
          if (this.IsDonate?.value) {
            this.transactionRecurrences = res.filter((o) => {
              return !(o.id === 6 || o.id === 7);
            });
          } else {
            this.transactionRecurrences = res.filter((o) => {
              return !(o.id === 6 || o.id === 7);
            });
          }
        },
        () => {
          this.isTransactionRecurrencesLoading = false;
        }
      );
    }
  }

  private disableRecurringOptions() {
    this.RecurringCount?.clearValidators();
    this.RecurringAmount?.clearValidators();
    this.RecurringFrequency?.clearValidators();
  }

  private enableAlwaysRecurring() {
    this.RecurringCount?.clearValidators();
    this.RecurringCount?.updateValueAndValidity();
    this.RecurringPayment?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  private disableAlwaysRecurringOptions() {
    this.RecurringCount?.setValidators(
      Validators.compose([Validators.required, CustomValidator.greaterThan(1, false, 'Count must be at least 2')])
    );
    this.RecurringCount?.updateValueAndValidity();
    this.RecurringPayment?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  scheduleAmountCalculation() {
    if (this.Amount?.valueChanges && this.RecurringCount?.valueChanges) {
      this.subscription = merge(
        this.Amount?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.RecurringCount.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      ).subscribe(() => {
        const schAmount = this.calculate();
        this.RecurringAmount?.patchValue(schAmount);
      });
    }
  }

  displayPreviewChanges() {
    if (
      this.Amount?.valueChanges &&
      this.RecurringCount?.valueChanges &&
      this.RecurringAmount?.valueChanges &&
      this.RecurringFrequency?.valueChanges &&
      this.TransDate?.valueChanges &&
      this.RecurringAlways?.valueChanges
    ) {
      this.priviewSubscription = merge(
        this.Amount?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.RecurringAmount?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.RecurringFrequency.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.TransDate.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.RecurringAlways.valueChanges.pipe(debounceTime(500), distinctUntilChanged()),
        this.RecurringCount.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      ).subscribe(() => {
        const data = [];
        const newData = [];

        if (
          this.Amount?.value &&
          this.RecurringFrequency?.value &&
          this.TransDate?.value &&
          ((!this.customLayout && (this.RecurringCount?.value || this.RecurringAlways?.value)) ||
            (this.customLayout && (!this.RecurringCount?.value || this.RecurringAlways?.value)))
        ) {
          const previewLength = this.toDisplayMaxPreview();

          for (let index = 0; index < previewLength; index++) {
            const d = this.createPreviewRow(index);
            data.push({
              ...d,
            });
          }

          // for last transaction record
          const d = this.createPreviewRow(this.RecurringCount?.value - 1);
          newData.push({
            ...d,
          });
        }

        this.previewList = data;
        this.previewListLast = newData;
      });
    }
  }

  toDisplayMaxPreview(): number {
    if (this.customLayout) {
      if (this.RecurringCount?.value && this.RecurringCount?.value <= 30) {
        return this.RecurringCount?.value;
      }

      return 30;
    }

    if (this.RecurringAlways?.value) {
      return 30;
    }

    if (this.RecurringCount?.value && this.RecurringCount?.value <= 30) {
      return this.RecurringCount?.value;
    }

    return 30;
  }

  createPreviewRow(index: number) {
    const endDate = this.TransDate?.value.endDate.toDate();
    const date = this.commonDataService.getPreviewDate(endDate, index, this.RecurringFrequency?.value);
    return {
      name: '',
      date,
      dateString: date.format('MMM. D YYYY'),
      amount: this.RecurringAlways?.value ? this.Amount?.value : this.RecurringAmount?.value,
    };
  }

  openDatepicker() {
    this.pickerDirective.open();
  }

  onPreviewSchedule() {
    this.modalService.open(this.previewScheduleContentModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-batch-close modal-schedule',
      size: 'md',
      scrollable: true,
    });
  }
}
