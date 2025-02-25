import { Component, OnInit, AfterViewInit, Input, AfterContentInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { shakeTrigger } from '@commons/animations';
import { CommonDataService } from '@commons/common-data-service.service';
import { DonorGetResponse } from '@services/API/donor-api.service';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-edit-address-popup',
  templateUrl: './edit-address-popup.component.html',
  styleUrls: ['./edit-address-popup.component.scss'],
  imports: [SharedModule, AddressAutocompleteDirective],
  animations: [shakeTrigger],
})
export class EditAddressPopupComponent implements OnInit, AfterContentInit, AfterViewInit {
  zipCodeMask = '00000';
  zipCodeValidation = true;
  private _isAnimate = false;

  isSubmitted = false;
  editAddressForm!: UntypedFormGroup;

  @Input() donorData!: DonorGetResponse;

  @Output() savedAddress: EventEmitter<boolean> = new EventEmitter();

  get IsAnimate() {
    return this._isAnimate;
  }

  get FirstName() {
    return this.editAddressForm.get('firstName');
  }

  get LastName() {
    return this.editAddressForm.get('lastName');
  }

  get Address() {
    return this.editAddressForm.get('mailingAddress');
  }

  get Apt() {
    return this.editAddressForm.get('apt');
  }

  get City() {
    return this.editAddressForm.get('city');
  }

  get State() {
    return this.editAddressForm.get('state');
  }

  get Zip() {
    return this.editAddressForm.get('zip');
  }

  constructor(
    private fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public commonDataService: CommonDataService
  ) {}

  ngOnInit(): void {
    this.editAddressForm = this.fb.group({
      firstName: this.fb.control(this.donorData.firstName, Validators.compose([Validators.required])),
      lastName: this.fb.control(this.donorData.lastName, Validators.compose([Validators.required])),
      mailingAddress: this.fb.control(this.donorData.address, Validators.compose([Validators.required])),
      apt: this.fb.control(this.donorData.apt, Validators.compose([])),
      city: this.fb.control(this.donorData.city, Validators.compose([Validators.required])),
      state: this.fb.control(this.donorData.state, Validators.compose([Validators.required])),
      zip: this.fb.control(
        this.donorData.zip,
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      ),
    });
  }

  ngAfterContentInit(): void {}

  ngAfterViewInit(): void {}

  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }

  onAddressChange(data: any) {
    if (data.notFound) {
      this.isSubmitted = true;
      this.Address?.setErrors({
        googleMapError: data.notFound,
      });

      this.Address?.markAsTouched();

      this.triggerAnimation();
      return;
    }

    let streetAddress = data.streetName;

    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }

    this.editAddressForm.patchValue({
      mailingAddress: streetAddress,
      city: data.locality.long || data.locality.short || data.sublocality,
      state: data.state.short,
      zip: data.postalCode,
    });

    if (!data?.country?.isFromUSA) {
      this.zipCodeMask = '';
      this.zipCodeValidation = false;
      this.Zip?.clearValidators();
      this.Zip?.updateValueAndValidity();
    }

    if (data?.country?.isFromUSA) {
      this.zipCodeMask = '00000';
      this.zipCodeValidation = true;
      this.Zip?.clearValidators();
      this.Zip?.setValidators(
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      );
      this.Zip?.updateValueAndValidity();
    }

    this.editAddressForm.updateValueAndValidity();
  }

  onSaveAddress() {
    this.isSubmitted = true;
    if (this.editAddressForm.invalid) {
      this.editAddressForm.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    this.savedAddress.emit({
      ...this.editAddressForm.value,
    });

    this.closePopup();
  }

  closePopup() {
    this.activeModal.close();
  }
}
