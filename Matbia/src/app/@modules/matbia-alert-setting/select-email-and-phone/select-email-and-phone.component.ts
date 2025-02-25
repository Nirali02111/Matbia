import { AfterContentInit, ChangeDetectorRef, Component, input, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { PageRouteVariable } from '@commons/page-route-variable';
import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaAlertSettingModule } from '../matbia-alert-setting.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-select-email-and-phone',
  templateUrl: './select-email-and-phone.component.html',
  styleUrls: ['./select-email-and-phone.component.scss'],
  imports: [SharedModule, MatbiaAlertSettingModule, InputErrorComponent],
})
export class SelectEmailAndPhoneComponent implements OnInit, AfterContentInit {
  @Input() formGroup!: UntypedFormGroup;

  isDeposit = input<boolean>(false);

  @Input() emailList: Array<EmailEntityObj> = [];

  @Input() isSwitchOn: any;

  @Input() phoneList: Array<PhoneEntityObj> = [];

  @Input() isManualEntry = false;

  @Input() emailPhoneRequiredError = false;

  get AlertSettingId() {
    return this.formGroup.get('entityAlertSettingId');
  }

  get isPaused() {
    return this.formGroup.get('isPaused');
  }

  get IsSendEmail() {
    return this.formGroup.get('isSendEmail');
  }

  get IsSendSMS() {
    return this.formGroup.get('isSendSMS');
  }

  get EntityPhoneId() {
    return this.formGroup.get('entityPhoneId');
  }

  get EmailCheckboxId() {
    const id = this.AlertSettingId?.value;
    return id ? `email-or-sms-email-${id}` : `email-or-sms-email`;
  }

  get SMSCheckboxId() {
    const id = this.AlertSettingId?.value;
    return id ? `email-or-sms-sms-${id}` : `email-or-sms-sms`;
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef, private pageRoute: PageRouteVariable) {}

  ngOnChanges() {
    if (this.isSwitchOn != undefined) {
      if (this.isSwitchOn) {
        this.formGroup.get('isSendEmail')?.enable();
        this.formGroup.get('isSendSMS')?.enable();
        this.formGroup.get('entityPhoneId')?.enable();
      } else {
        this.formGroup.get('isSendEmail')?.disable();
        this.formGroup.get('isSendSMS')?.disable();
        this.formGroup.get('entityPhoneId')?.disable();
      }
    }
  }

  ngOnInit(): void {
    this.formGroup.get('entityPhoneId')?.disable();

    this.IsSendSMS?.valueChanges.subscribe((val) => {
      if (val) {
        this.formGroup.get('entityPhoneId')?.enable();
        this.formGroup.get('entityPhoneId')?.setValidators(Validators.compose([Validators.required]));
        this.updateValueAndValidity();
        return;
      }

      this.formGroup.get('entityPhoneId')?.patchValue(null);
      this.formGroup.get('entityPhoneId')?.disable();
      this.formGroup.get('entityPhoneId')?.clearValidators();
      this.updateValueAndValidity();
    });

    if (this.isDeposit()) this.IsSendEmail?.disable();
  }

  updateValueAndValidity() {
    this.formGroup.get('entityPhoneId')?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  getProfileRouterLink() {
    return this.pageRoute.getProfileRouterLink();
  }
}
