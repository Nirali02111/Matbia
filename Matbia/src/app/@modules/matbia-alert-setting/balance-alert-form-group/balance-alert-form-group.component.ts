import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaAlertSettingModule } from '../matbia-alert-setting.module';
import { SelectEmailAndPhoneComponent } from '../select-email-and-phone/select-email-and-phone.component';

@Component({
  selector: 'app-balance-alert-form-group',
  templateUrl: './balance-alert-form-group.component.html',
  styleUrls: ['./balance-alert-form-group.component.scss'],
  imports: [SharedModule, MatbiaAlertSettingModule, SelectEmailAndPhoneComponent],
})
export class BalanceAlertFormGroupComponent implements OnInit, AfterContentInit {
  isEmailPhoneRequiredError: boolean = false;
  expand: boolean = false;

  isDeposit = input<boolean>(false);

  @Input() formGroup!: UntypedFormGroup;

  @Input() emailList: Array<EmailEntityObj> = [];

  @Input() phoneList: Array<PhoneEntityObj> = [];
  isSwitchOn: boolean = false;

  @Input() set emailPhoneRequiredError(val: boolean) {
    this.isEmailPhoneRequiredError = val;
    if (val) this.expand = true;
  }

  @Output() balanceFormValueUpdate: EventEmitter<any> = new EventEmitter();

  get IsPaused() {
    return this.formGroup.get('isPaused');
  }

  get Id(): string {
    return this.isDeposit() ? 'deposit-alert-form-group' : 'balance-alert-form-group';
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.formGroup.valueChanges.subscribe(() => {
      let balanceAlertForm = this.formGroup.value;
      let disable = balanceAlertForm.isPaused && !balanceAlertForm.isSendEmail && !balanceAlertForm.isSendSMS;

      this.balanceFormValueUpdate.emit(disable);
    });
    this.formGroup.get('isPaused')?.valueChanges.subscribe((value) => {
      this.isSwitchOn = value;
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  finalBalanceAlertValues() {
    const value = this.formGroup.getRawValue();

    const entityEmailId = this.emailList.find((o) => {
      return o.isDefault === true;
    })?.entityEmailId;

    const apiValue = {
      ...value,
      isPaused: !value.isPaused,
      entityEmailId,
      // Note: Tmp pass null value
      encryptedCardId: null,
    };

    return apiValue;
  }
}
