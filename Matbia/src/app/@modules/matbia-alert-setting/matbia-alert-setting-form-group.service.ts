import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { CustomValidator } from '@commons/custom-validator';

@Injectable()
export class MatbiaAlertSettingFormGroupService {
  constructor(private fb: UntypedFormBuilder) {}

  initTransactionAlertSettingFormGroup() {
    return this.fb.group({
      encryptedCardId: this.fb.control(null),
      entityId: this.fb.control(null),
      entityAlertSettingId: this.fb.control(null),

      isPaused: this.fb.control(false),
      isSendEmail: this.fb.control(false),
      isSendSMS: this.fb.control(false),
      entityEmailId: this.fb.control(null),
      entityPhoneId: this.fb.control(null),

      maxLimit: this.fb.control(
        null,
        Validators.compose([CustomValidator.greaterThan(2, true, '(Min. $2.00)', false)])
      ),
    });
  }

  initBalanceAlertSettingFormGroup(isDeposit = false) {
    return this.fb.group({
      encryptedCardId: this.fb.control(null),
      entityId: this.fb.control(null),
      entityAlertSettingId: this.fb.control(null),

      isPaused: this.fb.control(false),
      isSendEmail: this.fb.control(isDeposit),
      isSendSMS: this.fb.control(false),

      entityEmailId: this.fb.control(null),
      entityPhoneId: this.fb.control(null),

      minAccountBalance: this.fb.control(null),
    });
  }

  initManualAlertSettingFormGroup() {
    return this.fb.group({
      encryptedCardId: this.fb.control(null),
      entityId: this.fb.control(null),
      entityAlertSettingId: this.fb.control(null),

      isPaused: this.fb.control(false),
      isSendEmail: this.fb.control(false),
      isSendSMS: this.fb.control(false),
      entityEmailId: this.fb.control(null),
      entityPhoneId: this.fb.control(null),

      isManualEntryCharge: this.fb.control(null),
      fromDate: this.fb.control(null),
      toDate: this.fb.control(null),
    });
  }

  getMessage(isBalance: boolean, isTransaction: boolean, isManual: boolean, isRequest: boolean) {
    const balanceAlertMsg = 'Min. Funds Alert Paused';
    const transactionAlertMsg = 'Transaction Alert Paused';
    const manualAlertMsg = 'Manual Entry Alert Paused';
    const requestAlertMsg = 'Request Alert Paused';

    let message = '';

    if (isBalance) {
      message = `${balanceAlertMsg}`;
    }

    if (isTransaction) {
      if (isBalance) {
        message = `${message} /`;
      }

      message = `${message} ${transactionAlertMsg}`;
    }

    if (isManual) {
      if (isBalance || isTransaction) {
        message = `${message} /`;
      }

      message = `${message} ${manualAlertMsg}`;
    }

    if (isRequest) {
      if (isBalance || isTransaction || isManual) {
        message = `${message} /`;
      }

      message = `${message} ${requestAlertMsg}`;
    }

    return message;
  }
}
