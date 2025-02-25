import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { CommonDataService } from '@commons/common-data-service.service';

import dayjs from 'dayjs';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-business-user-form-group',
  templateUrl: './business-user-form-group.component.html',
  styleUrls: ['./business-user-form-group.component.scss'],
  imports: [SharedModule, PhoneInputComponent, AddressAutocompleteDirective],
})
export class BusinessUserFormGroupComponent implements OnInit, AfterContentInit, OnDestroy {
  isSubmited = false;

  zipCodeMask: string = '00000';

  @Input() formGroup!: UntypedFormGroup;

  @Output() fgSubmit = new EventEmitter();

  maxDate: dayjs.Dayjs = dayjs().subtract(18, 'year');
  minDate: dayjs.Dayjs = dayjs().subtract(99, 'year');

  @ViewChild('firstNameElm', { static: false }) firstNameElm!: ElementRef;
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;

  get FirstName() {
    return this.formGroup.get('firstName');
  }

  get LastName() {
    return this.formGroup.get('lastName');
  }

  get BirthDate() {
    return this.formGroup.get('birthDate');
  }

  get SSN() {
    return this.formGroup.get('ssn');
  }

  get Address() {
    return this.formGroup.get('address');
  }

  get Apt() {
    return this.formGroup.get('apt');
  }

  get City() {
    return this.formGroup.get('city');
  }

  get State() {
    return this.formGroup.get('state');
  }

  get Zip() {
    return this.formGroup.get('zip');
  }

  get Email() {
    return this.formGroup.get('email');
  }

  get Phone() {
    return this.formGroup.get('phone');
  }

  get Cellphone() {
    return this.formGroup.get('cellPhone');
  }

  setIsSubmited() {
    this.isSubmited = true;
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef, public commonDataService: CommonDataService) {}

  ngOnInit(): void {
    this.clearDateValue();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {}

  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
  }

  onAddressChange(data: any) {
    let streetAddress = data.streetName;

    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }

    this.formGroup.patchValue({
      address: streetAddress,
      city: data.locality.long || data.locality.short || data.sublocality,
      state: data.state.short,
      zip: data.postalCode,
    });

    if (!data?.country?.isFromUSA) {
      this.zipCodeMask = '';
      this.Zip?.clearValidators();
      this.Zip?.updateValueAndValidity();
    }

    if (data?.country?.isFromUSA) {
      this.zipCodeMask = '00000';
      this.Zip?.clearValidators();
      this.Zip?.setValidators(
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      );
      this.Zip?.updateValueAndValidity();
    }

    this.formGroup.updateValueAndValidity();
  }

  triggerRegister() {
    this.fgSubmit.emit(true);
  }

  /**
   * call this from parent component to set cursur
   */
  doFocus() {
    this.firstNameElm.nativeElement.focus();
  }

  clearDateValue() {
    this.BirthDate?.patchValue(null);
    this.BirthDate?.updateValueAndValidity();
  }
}
