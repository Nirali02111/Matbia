import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import moment from 'moment';

import { SharedModule } from '@matbia/shared/shared.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@Component({
  selector: 'app-set-reminder-popup',
  templateUrl: './set-reminder-popup.component.html',
  styleUrls: ['./set-reminder-popup.component.scss'],
  imports: [SharedModule, NgxMaterialTimepickerModule],
})
export class SetReminderPopupComponent implements OnInit {
  formGroup!: UntypedFormGroup;

  get SelectedOption() {
    return this.formGroup.get('option');
  }

  get SnoozeDate() {
    return this.formGroup.get('snoozeDate');
  }

  get SnoozeTime() {
    return this.formGroup.get('time');
  }

  @Output() setSnoozeDate = new EventEmitter();

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;

  constructor(private fb: UntypedFormBuilder, public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      option: this.fb.control('nextDay'),
      snoozeDate: this.fb.control({
        startDate: moment(new Date()).add(1, 'day').startOf('day'),
        endDate: moment(new Date()).add(1, 'day').startOf('day'),
      }),

      time: '05:00 AM',
    });

    this.SelectedOption?.valueChanges.subscribe((val) => {
      if (val === 'nextDay') {
        this.SnoozeDate?.patchValue({
          startDate: moment(new Date()).add(1, 'day').startOf('day'),
          endDate: moment(new Date()).add(1, 'day').startOf('day'),
        });
      }

      if (val === 'nextWeek') {
        this.SnoozeDate?.patchValue({
          startDate: moment(new Date()).add(6, 'day').startOf('day'),
          endDate: moment(new Date()).add(6, 'day').startOf('day'),
        });
      }

      if (val === 'nextMonth') {
        this.SnoozeDate?.patchValue({
          startDate: moment(new Date()).add(29, 'day').startOf('day'),
          endDate: moment(new Date()).add(29, 'day').startOf('day'),
        });
      }

      if (val === 'custom') {
        this.SnoozeDate?.patchValue({
          startDate: null,
          endDate: null,
        });
      }

      this.formGroup.updateValueAndValidity();
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  openDatepicker() {
    this.pickerDirective.open();
  }

  datesUpdated() {
    this.formGroup.patchValue(
      {
        option: 'custom',
      },
      {
        emitEvent: false,
      }
    );

    this.formGroup.updateValueAndValidity();
  }

  onScheduleReminder() {
    this.closePopup();

    const obj = this.getHoursAndMin();

    const endDate = moment(this.SnoozeDate?.value.endDate);

    endDate.set({ ...obj });
    this.setSnoozeDate.emit(endDate);
  }

  private getHoursAndMin() {
    const timeArray = (this.SnoozeTime?.value as string).split(' ');
    const valueArray = timeArray[0].split(':');
    if (timeArray[1] === 'AM') {
      return {
        h: parseInt(valueArray[0], 10),
        m: parseInt(valueArray[1], 10),
      };
    }

    return {
      h: parseInt(valueArray[0], 10) !== 12 ? parseInt(valueArray[0], 10) + 12 : parseInt(valueArray[0], 10),
      m: parseInt(valueArray[1], 10),
    };
  }
}
