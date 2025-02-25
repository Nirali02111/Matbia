import { AfterContentInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { SlideInOutAnimation } from '@commons/animations';
import { CardPinInputComponent } from '@matbia/matbia-input/card-pin-input/card-pin-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-bank-and-credit-card-form-group',
  templateUrl: './bank-and-credit-card-form-group.component.html',
  styleUrls: ['./bank-and-credit-card-form-group.component.scss'],
  imports: [SharedModule, CardPinInputComponent, InputErrorComponent],
  animations: [SlideInOutAnimation],
})
export class BankAndCreditCardFormGroupComponent implements OnInit, AfterContentInit {
  public accountHolderNamePatterns = { L: { pattern: new RegExp(`[A-Za-z0-9 '-]`) } };
  public CVVMask = '0000';

  public accountOptions = [
    {
      value: 'SAVINGS',
      label: 'Savings',
    },
    {
      value: 'CHECKING',
      label: 'Checking',
    },
  ];

  @Input() formGroup!: UntypedFormGroup;
  @Input() optionTypeEnable = true;

  isShowing = false;
  animationState = 'out';

  get OptionType() {
    return this.formGroup.get('optionType');
  }

  get AccountType() {
    return this.formGroup.get('accountType');
  }

  get AccountName() {
    return this.formGroup.get('accountName');
  }

  get CheckType() {
    return this.formGroup.get('checkType');
  }

  get RoutingNumber() {
    return this.formGroup.get('routingNumber');
  }

  get AccountNumber() {
    return this.formGroup.get('accountNumber');
  }

  get ConfirmNumber() {
    return this.formGroup.get('confirmNumber');
  }

  get NameOnCard() {
    return this.formGroup.get('nameOnCard');
  }

  get CardNumber() {
    return this.formGroup.get('cardNumber');
  }

  get CardExp() {
    return this.formGroup.get('cardExp');
  }

  get CVV() {
    return this.formGroup.get('cvv');
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef, private fb: UntypedFormBuilder) {}
  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.OptionType?.valueChanges.subscribe((val) => {
      if (val) {
        if (val === 'bank') {
          this.initBankFields();
        }

        if (val === 'credit_card') {
          this.initCreditCardFields();
        }

        this.formGroup.updateValueAndValidity();
      }
    });

    this.AccountName?.disable();
  }

  updateVAlueAndValidator() {
    this.AccountName?.updateValueAndValidity();
    this.AccountType?.updateValueAndValidity();
    this.RoutingNumber?.updateValueAndValidity();
    this.AccountNumber?.updateValueAndValidity();
    this.ConfirmNumber?.updateValueAndValidity();
    this.CheckType?.updateValueAndValidity();

    this.NameOnCard?.updateValueAndValidity();
    this.CardNumber?.updateValueAndValidity();
    this.CardExp?.updateValueAndValidity();
    this.CVV?.updateValueAndValidity();
  }

  matchAccountNumber(): ValidatorFn {
    return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
      if (
        inputControl.value !== undefined &&
        inputControl.value.trim() !== '' &&
        inputControl.value !== this.AccountNumber?.value
      ) {
        return { mismatch: true };
      }

      return null;
    };
  }

  initBankFields() {
    this.AccountType?.setValidators(Validators.compose([Validators.required]));
    this.AccountName?.setValidators(Validators.compose([Validators.required]));
    this.RoutingNumber?.setValidators(Validators.compose([Validators.required]));
    this.AccountNumber?.setValidators(Validators.compose([Validators.required]));
    this.ConfirmNumber?.setValidators(Validators.compose([Validators.required, this.matchAccountNumber()]));
    this.CheckType?.setValidators(Validators.compose([Validators.required]));

    // card
    this.NameOnCard?.clearValidators();
    this.CardNumber?.clearValidators();
    this.CardExp?.clearValidators();
    this.CVV?.clearValidators();

    this.updateVAlueAndValidator();
  }

  initCreditCardFields() {
    this.NameOnCard?.setValidators(Validators.compose([Validators.required]));
    this.CardNumber?.setValidators(Validators.compose([Validators.required]));
    this.CardExp?.setValidators(Validators.compose([Validators.required]));
    this.CVV?.setValidators(Validators.compose([Validators.required]));

    // bank
    this.AccountType?.clearValidators();
    this.AccountName?.clearValidators();
    this.RoutingNumber?.clearValidators();
    this.AccountNumber?.clearValidators();
    this.ConfirmNumber?.clearValidators();
    this.CheckType?.clearValidators();

    this.updateVAlueAndValidator();
  }

  setAccountType(value: string) {
    this.AccountType?.patchValue(value);
    this.AccountType?.updateValueAndValidity();
    this.toggle();
  }

  toggle() {
    this.animationState = this.animationState === 'out' ? 'in' : 'out';
  }

  displayLabelAccountType() {
    const obj = this.accountOptions.find((o) => o.value === this.AccountType?.value);
    return obj ? obj.label : 'Choose Account Type';
  }
}
