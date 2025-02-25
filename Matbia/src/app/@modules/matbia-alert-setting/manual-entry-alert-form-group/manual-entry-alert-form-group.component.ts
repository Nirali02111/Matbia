import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaAlertSettingModule } from '../matbia-alert-setting.module';
import { SelectEmailAndPhoneComponent } from '../select-email-and-phone/select-email-and-phone.component';

@Component({
  selector: 'app-manual-entry-alert-form-group',
  templateUrl: './manual-entry-alert-form-group.component.html',
  styleUrls: ['./manual-entry-alert-form-group.component.scss'],
  imports: [SharedModule, MatbiaAlertSettingModule, SelectEmailAndPhoneComponent],
})
export class ManualEntryAlertFormGroupComponent implements OnInit, AfterContentInit {
  isEmailPhoneRequiredError: boolean = false;
  expand: boolean = false;

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;
  @Input() formGroup!: UntypedFormGroup;

  @Input() emailList: Array<EmailEntityObj> = [];

  @Input() phoneList: Array<PhoneEntityObj> = [];

  @Input() set emailPhoneRequiredError(val: boolean) {
    this.isEmailPhoneRequiredError = val;
    if (val) this.expand = true;
  }

  @Output() manualFormValueUpdate: EventEmitter<any> = new EventEmitter();

  isSwitchOn: boolean = false;

  get IsPaused() {
    return this.formGroup.get('isPaused');
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isSwitchOn = this.formGroup.get('isPaused')?.value;

    this.formGroup.valueChanges.subscribe(() => {
      let manualAlertForm = this.formGroup.value;
      let disable = manualAlertForm.isPaused && !manualAlertForm.isSendEmail && !manualAlertForm.isSendSMS;

      this.manualFormValueUpdate.emit(disable);

      this.formGroup.get('isPaused')?.valueChanges.subscribe((value) => {
        this.isSwitchOn = value;
      });
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  openDatepicker() {
    this.pickerDirective.open();
  }

  finalManualEntryApiValue() {
    const value = this.formGroup.value;

    const entityEmailId = this.emailList.find((o) => {
      return o.isDefault === true;
    })?.entityEmailId;

    const apiValue = {
      ...value,
      isPaused: !value.isPaused,
      entityEmailId,

      fromDate: value?.fromDate && value?.fromDate?.fromDate ? value?.fromDate?.fromDate : null,
      toDate: value?.toDate && value?.toDate?.toDate ? value?.toDate?.toDate : null,
    };

    return apiValue;
  }
}
