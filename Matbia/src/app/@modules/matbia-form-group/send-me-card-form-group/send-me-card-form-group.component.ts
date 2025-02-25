import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-send-me-card-form-group',
  templateUrl: './send-me-card-form-group.component.html',
  styleUrls: ['./send-me-card-form-group.component.scss'],
  imports: [SharedModule, ButtonLoaderComponent],
})
export class SendMeCardFormGroupComponent implements OnInit {
  @Input() isLoading = false;

  @Input() formGroup!: UntypedFormGroup;

  @Output() openEditPopup = new EventEmitter();

  @Output() canRequest = new EventEmitter();

  get Name() {
    return this.formGroup.get('fullName');
  }

  get Address() {
    return this.formGroup.get('mailingAddress');
  }

  get Apt() {
    return this.formGroup.get('apt');
  }

  get CityStateZip() {
    return this.formGroup.get('cityStateZip');
  }

  get DisplayAddress() {
    if (this.Apt?.value) {
      return `${this.Address?.value} ${this.Apt.value} ${this.CityStateZip?.value}`;
    }

    return `${this.Address?.value} ${this.CityStateZip?.value}`;
  }

  constructor() {}

  ngOnInit(): void {}

  open() {
    this.openEditPopup.emit();
  }

  onRequest() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.canRequest.emit();
  }
}
