import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDateRangeInput, MatDateRangePicker } from '@angular/material/datepicker';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';

@Component({
  selector: 'app-maaser-calculator-popup',
  templateUrl: './maaser-calculator-popup.component.html',
  styleUrl: './maaser-calculator-popup.component.css',
  imports: [SharedModule, MatFormFieldModule, MatDateRangeInput, MatDateRangePicker, AmountInputComponent],
  providers: [provideNativeDateAdapter()],
})
export class MaaserCalculatorPopupComponent {
  charityCalculatorForm: FormGroup = new FormGroup({});
  @ViewChild('radioMaaser') radioMaaser!: ElementRef;
  get charityAmount() {
    const earningAmount = this.earningAmount?.value;
    const percentage = this.charityPercentage?.value;

    return earningAmount * (+percentage / 100) || 0;
  }

  get charityPercentage() {
    return this.charityCalculatorForm.get('percentage');
  }

  get earningAmount() {
    return this.charityCalculatorForm.get('earningAmount');
  }

  get payPeriod() {
    return this.charityCalculatorForm.get('payPeriod');
  }

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.initializeCharityForm();
    this.charityPercentage?.valueChanges.subscribe(() => {});
  }

  initializeCharityForm() {
    this.charityCalculatorForm = this.fb.group({
      earningAmount: [null, [Validators.required, Validators.min(0)]],
      percentage: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      payerName: [''],
      payPeriod: [''],
    });
  }

  ngAfterViewInit(): void {
    (this.radioMaaser.nativeElement as HTMLInputElement).click();
  }

  checkRange(e: any) {
    const charCode = e.which ? e.which : e.keyCode;

    // Allow non-numeric keys (backspace, delete, etc.)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false; // Block non-numeric characters
    }

    const currentValue = e.target.value;
    const newValue = currentValue + String.fromCharCode(charCode);

    // Block the input if the new value exceeds 100
    if (+newValue > 100) return false;

    return true; // Allow input
  }

  submitForm() {
    this.charityCalculatorForm.markAllAsTouched();
    if (this.charityCalculatorForm.invalid) return;
    this.closeModal(true);
  }

  closeModal(isApply: boolean = false) {
    this.activeModal.close(isApply ? { ...this.charityCalculatorForm.value, charityAmount: this.charityAmount } : '');
  }

  dateRangeChange(fromDate: HTMLInputElement, toDate: HTMLInputElement) {
    this.payPeriod?.setValue(`${fromDate.value} - ${toDate.value}`);
  }

  resetPercentage(maaserControl: HTMLInputElement, chomeshComtrol: HTMLInputElement) {
    maaserControl.checked = false;
    chomeshComtrol.checked = false;
    this.charityPercentage?.setValue(null);
  }
}
