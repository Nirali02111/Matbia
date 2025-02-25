import { Component, AfterContentInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

import { SharedModule } from '@matbia/shared/shared.module';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-online-account-form-group',
  templateUrl: './online-account-form-group.component.html',
  styleUrls: ['./online-account-form-group.component.scss'],
  imports: [SharedModule, NgOtpInputModule, InputErrorComponent, ButtonLoaderComponent],
})
export class OnlineAccountFormGroupComponent implements AfterContentInit {
  @Input() formGroup!: FormGroup;

  @Input() isLoading = false;

  @Output() fgSubmit = new EventEmitter();

  public pinConfig = {
    length: 4,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'form-control otp-input-password',
    containerClass: 'pinnumber-box',
  };

  get EmailWithCard() {
    return this.formGroup.get('email');
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  onOtpChange(data: any) {
    this.formGroup.patchValue({
      pin: data,
    });

    this.formGroup.updateValueAndValidity();
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.fgSubmit.emit();
  }
}
