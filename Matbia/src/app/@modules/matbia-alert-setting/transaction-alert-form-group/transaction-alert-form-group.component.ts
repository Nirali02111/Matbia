import { Component, Input, OnInit, AfterContentInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaAlertSettingModule } from '../matbia-alert-setting.module';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { SelectEmailAndPhoneComponent } from '../select-email-and-phone/select-email-and-phone.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-transaction-alert-form-group',
  templateUrl: './transaction-alert-form-group.component.html',
  styleUrls: ['./transaction-alert-form-group.component.scss'],
  imports: [
    SharedModule,
    MatbiaAlertSettingModule,
    AmountInputComponent,
    SelectEmailAndPhoneComponent,
    InputErrorComponent,
  ],
})
export class TransactionAlertFormGroupComponent implements OnInit, AfterContentInit {
  isEmailPhoneRequiredError: boolean = false;
  expand: boolean = false;

  @Input() formGroup!: UntypedFormGroup;

  @Input() emailList: Array<EmailEntityObj> = [];

  @Input() phoneList: Array<PhoneEntityObj> = [];

  @Input() isRequestType: boolean = false;
  isSwitchOn: boolean = false;

  @Input() set emailPhoneRequiredError(val: boolean) {
    this.isEmailPhoneRequiredError = val;
    if (val) this.expand = true;
  }

  @Output() transactionFormValueUpdate: EventEmitter<any> = new EventEmitter();

  get IsPaused() {
    return this.formGroup.get('isPaused');
  }

  get MaxLimit() {
    return this.formGroup.get('maxLimit');
  }

  get SwitchHtmlIdValue() {
    if (this.isRequestType) {
      return 'flexSwitchCheckDefault4';
    }

    return 'flexSwitchCheckDefault1';
  }

  get AccordionHtmlIdValue() {
    if (this.isRequestType) {
      return 'req-alert';
    }

    return 'tra-alert';
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isSwitchOn = this.formGroup.get('isPaused')?.value;
    this.formGroup.valueChanges.subscribe(() => {
      let transactionForm = this.formGroup.value;
      let disable = transactionForm.isPaused && !transactionForm.isSendEmail && !transactionForm.isSendSMS;

      this.transactionFormValueUpdate.emit(disable);
    });
    this.formGroup.get('isPaused')?.valueChanges.subscribe((value) => {
      this.isSwitchOn = value;
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  finalTransactionAlertValues() {
    const value = this.formGroup.value;

    const entityEmailId = this.emailList.find((o) => {
      return o.isDefault === true;
    })?.entityEmailId;

    const apiValue = {
      ...value,
      isPaused: !value.isPaused,
      entityEmailId,
    };

    return apiValue;
  }
}
