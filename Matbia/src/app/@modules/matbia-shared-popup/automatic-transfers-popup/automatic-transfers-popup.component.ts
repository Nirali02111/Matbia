import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import dayjs from 'dayjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { shakeTrigger } from '@commons/animations';
import { CustomValidator } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { OrganizationAPIService } from '@services/API/organization-api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface AutoRedeemScheduleData {
  frequency: string;
  scheduleDate: string;
  amount: number;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';

@Component({
  selector: 'app-automatic-transfers-popup',
  templateUrl: './automatic-transfers-popup.component.html',
  styleUrls: ['./automatic-transfers-popup.component.scss'],
  imports: [SharedModule, AmountInputComponent],
  animations: [shakeTrigger],
})
export class AutomaticTransfersPopupComponent implements OnInit, AfterContentInit {
  isSubmitted = false;
  inAnimation = false;
  formGroup!: UntypedFormGroup;

  @Input() availableToRedeem!: number;
  @Input() amount!: number;

  @Input() haveScheduleAutoRedeem!: boolean;

  @Input() isOnAutoRedeem!: boolean;
  @Input() isOnSchedule!: boolean;

  /**
   * already selected values from API response
   */
  @Input() selectedFrequency!: number;
  @Input() selectedDay!: number;
  @Input() selectedDate!: number;

  maxDate: dayjs.Dayjs = dayjs().add(30, 'days');
  minDate: dayjs.Dayjs = dayjs();

  @Output() emtOnRedeemSchedule: EventEmitter<AutoRedeemScheduleData> = new EventEmitter();

  get Frequency() {
    return this.formGroup.get('frequency');
  }

  get SelectedDay() {
    return this.formGroup.get('selectedDay');
  }

  get EnterAmount() {
    return this.formGroup.get('amount');
  }

  get ScheduleDate() {
    return this.formGroup.get('scheduleDate');
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

  daysList = moment.weekdays().map((value, id) => {
    return { id, value };
  });

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private router: Router,
    public activeModal: NgbActiveModal,
    private pageRoute: PageRouteVariable,
    public notification: NotificationService,
    private organizationAPI: OrganizationAPIService
  ) {}

  ngOnInit(): void {
    const selectedOption = this.isOnAutoRedeem
      ? '7'
      : this.selectedFrequency
      ? this.selectedFrequency.toString()
      : null;

    this.formGroup = this.fb.group({
      frequency: [selectedOption, Validators.compose([Validators.required])],
      amount: [
        this.isOnAutoRedeem ? this.amount : null,
        Validators.compose([CustomValidator.greaterThan(100, true, 'Amount should be more then $100', true)]),
      ],
      selectedDay: [this.isOnSchedule ? this.selectedDay : null],
      scheduleDate: [
        this.selectedDate ? { startDate: moment(this.selectedDate), endDate: moment(this.selectedDate) } : null,
      ],
    });

    this.Frequency?.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe(() => {
      if (this.isThreshold) {
        this.EnterAmount?.enable();

        this.formGroup.patchValue({
          amount: this.amount ? this.amount : null,
        });

        this.formGroup.updateValueAndValidity();
        return;
      }

      this.formGroup.patchValue({
        amount: null,
      });

      this.EnterAmount?.disable();

      this.formGroup.updateValueAndValidity();
    });

    if (this.isOnSchedule) {
      this.EnterAmount?.disable();
      this.formGroup?.patchValue({ amount: null });
    }
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  displayDay() {
    const obj = this.daysList.find((o) => o.id === this.SelectedDay?.value);
    return obj?.value || '';
  }

  closePopup() {
    this.activeModal.dismiss();
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

  onSave() {
    this.isSubmitted = true;
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

    if (this.isMonthly && !this.ScheduleDate?.value) {
      this.triggerAnimation();
      this.formGroup.markAllAsTouched();
      return;
    }

    if (+this.EnterAmount?.value < 100) {
      this.closePopup();
      const title = this.getMessage();

      const modal = this.notification.initWarningPopup(
        title,
        'Note: in the event that the amount available to redeem is under the minimum automatic redeem amount of $100, auto redeem will take place at the next scheduled redeem date'
      );

      modal.then((res) => {
        if (res.isConfirmed) {
          this.confirmed();
        }
      });

      return;
    }

    this.confirmed();
  }

  private confirmed() {
    if (this.isWeekly) {
      this.emtOnRedeemSchedule.emit({
        ...this.formGroup.value,
        amount: null,
        frequency: +this.Frequency?.value,
        scheduleDate: moment().startOf('isoWeek').add(1, 'week').day(this.displayDay()),
        selectedDay: this.displayDay(),
      });

      this.closePopup();
      return;
    }

    if (this.isMonthly) {
      this.emtOnRedeemSchedule.emit({
        ...this.formGroup.value,
        frequency: +this.Frequency?.value,
        amount: null,
        scheduleDate: !this.ScheduleDate?.value ? moment() : this.ScheduleDate?.value.startDate,
      });
      this.closePopup();
      return;
    }

    if (this.isDaily) {
      this.emtOnRedeemSchedule.emit({
        ...this.formGroup.value,
        frequency: +this.Frequency?.value,
        amount: null,
        scheduleDate: moment(),
      });

      this.closePopup();
      return;
    }

    this.closePopup();

    if (this.isThreshold) {
      this.saveAutoRedeem();
      return;
    }
  }

  private getMessage() {
    const msg = `auto redeem has been created`;
    if (this.isDaily) {
      return `Daily ${msg}`;
    }

    if (this.isWeekly) {
      return `Weekly ${msg}`;
    }

    return `Monthly ${msg}`;
  }

  private saveAutoRedeem() {
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
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
}
