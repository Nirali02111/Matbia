import { AfterContentInit, ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { shakeTrigger } from '@commons/animations';
import { CommonDataService } from '@commons/common-data-service.service';
import { AbstractControlWarning } from '@commons/custom-validator';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { Assets } from '@enum/Assets';
import { MATBIA_CARD_STATUS } from '@enum/MatbiaCard';
import { USPSResponsePopupComponent } from '@matbia/matbia-usps/uspsresponse-popup/uspsresponse-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';
import { USPSService } from '@services/usps.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { NgOtpInputModule } from 'ng-otp-input';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-donor-profile-form-group',
  templateUrl: './donor-profile-form-group.component.html',
  styleUrls: ['./donor-profile-form-group.component.scss'],
  imports: [
    SharedModule,
    NgOtpInputModule,
    PhoneInputComponent,
    AddressAutocompleteDirective,
    CreditCardInputComponent,
  ],
  animations: [shakeTrigger],
})
export class DonorProfileFormGroupComponent implements OnInit, AfterContentInit {
  message: any;
  imagePath: any;
  url: any;

  private _isAnimate = false;

  zipCodeMask: string = '00000';
  zipCodeValidation = true;
  employerIdMask = '';
  employerIdValidation = false;
  entityId: string = '';
  showCardCase: boolean = false;

  @Input() profileIcon = Assets.PROFILE_IMAGE;

  @Input() formGroup!: UntypedFormGroup;

  @Input() isAutoSuggestion!: boolean;

  @Input() isSubmitted = false;

  @Output() canCallAPI: EventEmitter<boolean> = new EventEmitter();

  @Output() profileValue: EventEmitter<any> = new EventEmitter();

  get FirstName(): AbstractControlWarning | null {
    return this.formGroup.get('data_input_field_1');
  }

  get LastName(): AbstractControlWarning | null {
    return this.formGroup.get('data_input_field_2');
  }

  get Address(): AbstractControlWarning | null {
    return this.formGroup.get('data_input_field_3');
  }

  get Apt() {
    return this.formGroup.get('apt');
  }

  get City(): AbstractControlWarning | null {
    return this.formGroup.get('city');
  }

  get State() {
    return this.formGroup.get('state');
  }

  get Zip() {
    return this.formGroup.get('zip');
  }

  get Email(): AbstractControlWarning | null {
    return this.formGroup.get('email');
  }

  get Phone() {
    return this.formGroup.get('phone');
  }

  get Cellphone() {
    return this.formGroup.get('cellPhone');
  }

  get IsBusinessAccount() {
    return this.formGroup.get('isBusinessAccount');
  }

  get BusinessName() {
    return this.formGroup.get('businessName');
  }

  get TaxId() {
    return this.formGroup.get('taxId');
  }

  get HeardAboutUs() {
    return this.formGroup.get('heardAboutUs');
  }

  get IsAnimate() {
    return this._isAnimate;
  }

  get Pin() {
    return this.formGroup.get('pin');
  }

  get cardNum() {
    return this.formGroup.get('cardNum');
  }

  public pinConfig = {
    length: 4,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'form-control otp-input-password',
    containerClass: 'pinnumber-box',
  };

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    public commonDataService: CommonDataService,
    private uspsService: USPSService,
    private localStorageDataService: LocalStorageDataService,
    private matbiaCardAPI: MatbiaCardAPIService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    var cardOrEmailValue = this.localStorageDataService.getUserCardOrEmailValue()?.cardOrEmailValue;
    if (cardOrEmailValue) {
      this.cardNum?.setValue(cardOrEmailValue);
    }
    this.IsBusinessAccount?.valueChanges.subscribe((val) => {
      if (val) {
        this.setBusinessValidation();
        return;
      }

      this.removeBusinessValidation();
      return;
    });

    const state = history.state;
    if (state?.text === 'prepaidCreateAccount') this.showCardCase = true;
    else this.showCardCase = false;
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  private setBusinessValidation() {
    this.BusinessName?.clearValidators();

    this.BusinessName?.setValidators(Validators.compose([Validators.required]));

    this.BusinessName?.updateValueAndValidity();

    this.TaxId?.clearValidators();
    this.TaxId?.setValidators(Validators.compose([Validators.required]));
    this.employerIdMask = '00-0000000';
    this.employerIdValidation = true;
    this.TaxId?.updateValueAndValidity();

    this.formGroup.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  private removeBusinessValidation() {
    this.BusinessName?.clearValidators();
    this.BusinessName?.updateValueAndValidity();

    this.TaxId?.clearValidators();
    this.TaxId?.updateValueAndValidity();

    this.employerIdMask = '';
    this.employerIdValidation = false;

    this.formGroup.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const listOfFiles = [];
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < event.target.files.length; index++) {
        const file = event.target.files[index];
        listOfFiles.push(file);
      }

      const selectedFile = event.target.files[0];

      this.formGroup.patchValue({
        orgLogo: {
          fileName: selectedFile.name,
        },
      });

      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = this.handleReaderLoaded.bind(this);
    }
  }

  handleReaderLoaded(e: any) {
    this.profileIcon = e.target.result;
    const base64textString = (e.target.result || 'base64,').split('base64,')[1];

    this.formGroup.patchValue({
      profileImage: {
        fileBase64: base64textString,
      },
    });
  }

  removeImage() {
    this.profileIcon = Assets.PROFILE_IMAGE;
    this.formGroup.patchValue({
      profileImage: {
        fileName: '',
        fileBase64: '',
      },
    });
  }

  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
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

    this.formGroup.patchValue({
      data_input_field_3: streetAddress,
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

    this.formGroup.updateValueAndValidity();
  }

  resettingUSPSError() {
    if (this.Address?.hasError('uspsError')) {
      if (this.Address?.errors) {
        const { uspsError, ...errors } = this.Address?.errors;
        this.Address?.setErrors(errors);
        this.Address?.updateValueAndValidity();
      }
    }

    if (this.City?.hasError('uspsError')) {
      if (this.City?.errors) {
        const { uspsError, ...errors } = this.City?.errors;
        this.City?.setErrors(errors);
        this.City?.updateValueAndValidity();
      }
    }

    if (this.Zip?.hasError('uspsError')) {
      if (this.Zip?.errors) {
        const { uspsError, ...errors } = this.Zip?.errors;
        this.Zip?.setErrors(errors);
        this.Zip?.updateValueAndValidity();
      }
    }

    if (this.Apt?.hasError('uspsError')) {
      if (this.Apt?.errors) {
        const { uspsError, ...errors } = this.Apt?.errors;
        this.Apt?.setErrors(errors);
        this.Apt?.updateValueAndValidity();
      }
    }
  }

  onAddressValidate() {
    if (!this.zipCodeValidation) {
      this.canCallAPI.emit(true);
      return;
    }

    const address = this.uspsService.getAddressWithAPT(this.Address?.value, this.Apt?.value);

    const xmlsNode = this.uspsService.getSimpleAddressXMLNode(
      address,
      this.City?.value,
      this.State?.value,
      this.Zip?.value
    );

    const payload = this.uspsService.getAddressValidateRequestPayload(xmlsNode);

    this.uspsService.validateAddress(payload).subscribe(
      (res: any) => {
        if (!res.isValid) {
          this.checkUSPSResponse(res.message);
          return;
        }
        if (res.isValid) {
          const cityObjs = {
            city: this.City?.value,
            uspsCity: res.city,
          };

          const stateObjs = {
            state: this.State?.value,
            uspsState: res.state,
          };

          const zipObjs = { zip: this.Zip?.value, uspsZip: res.zip };

          if (this.uspsService.isCityStateZipDifferent(cityObjs, stateObjs, zipObjs)) {
            this.openUSPSContinue('', false, false, {
              uspsAddress: res.address,
              uspsCity: res.city,
              uspsState: res.state,
              uspsZip: res.zip,
            });
            return;
          }

          this.canCallAPI.emit(true);
        }
      },
      (err) => {
        console.log('error', err);
      }
    );
  }

  checkUSPSResponse(description: string) {
    if (this.uspsService.isErrorOnDefaultText(description)) {
      this.openUSPSContinue(description, true, false);
      return;
    }

    if (this.uspsService.isErrorOnAddress(description)) {
      this.openUSPSContinue(description, false, true);
      return;
    }

    this.checkAddress(description);
  }

  openUSPSContinue(
    description: string,
    isAPT = false,
    isAddress = false,
    uspsResponse: { uspsAddress: string; uspsCity: string; uspsState: string; uspsZip: string } | null = null
  ) {
    const modal = this.modalService.open(USPSResponsePopupComponent, {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'usps-modal-main',
    });

    if (uspsResponse) {
      modal.componentInstance.isDifferentResponse = true;

      modal.componentInstance.address = uspsResponse.uspsAddress;
      modal.componentInstance.city = uspsResponse.uspsCity;
      modal.componentInstance.state = uspsResponse.uspsState;
      modal.componentInstance.zip = uspsResponse.uspsZip;

      modal.closed.subscribe((closeDescription: string) => {
        if (closeDescription) {
          this.canCallAPI.emit(true);
        }
      });
      modal.componentInstance.continueOnNewAddress.subscribe(() => {
        const formattedAddress = this.uspsService.removeAPTfromAddress(uspsResponse.uspsAddress);
        this.Address?.patchValue(formattedAddress);
        this.City?.patchValue(uspsResponse.uspsCity);
        this.State?.patchValue(uspsResponse.uspsState);
        this.Zip?.patchValue(uspsResponse.uspsZip);

        this.canCallAPI.emit(true);
      });

      return;
    }

    modal.componentInstance.isAPT = isAPT;
    modal.componentInstance.isAddress = isAddress;
    modal.componentInstance.description = description;

    modal.closed.subscribe((closeDescription: string) => {
      if (closeDescription) {
        this.checkAddress(closeDescription);
      }
    });

    modal.componentInstance.continueOnAddress.subscribe(() => {
      this.canCallAPI.emit(true);
    });
  }

  checkAddress(description: string) {
    if (
      this.uspsService.isErrorOnAddress(description) ||
      this.uspsService.isErrorOnCity(description) ||
      this.uspsService.isErrorOnZip(description) ||
      this.uspsService.isErrorOnApt(description)
    ) {
      if (this.uspsService.isErrorOnAddress(description)) {
        this.Address?.setErrors({
          uspsError: description,
        });
      }

      if (this.uspsService.isErrorOnCity(description)) {
        this.City?.setErrors({
          uspsError: description,
        });
      }

      if (this.uspsService.isErrorOnZip(description)) {
        this.Zip?.setErrors({
          uspsError: description,
        });
      }

      if (this.uspsService.isErrorOnApt(description)) {
        this.Apt?.setValidators(Validators.compose([Validators.required]));
        this.Apt?.updateValueAndValidity();
        this.Apt?.setErrors({
          uspsError: description,
        });
        this.Apt?.markAllAsTouched();
      }
    } else {
      this.Address?.setErrors({
        uspsError: description,
      });

      this.City?.setErrors({
        uspsError: description,
      });

      this.Zip?.setErrors({
        uspsError: description,
      });

      this.Address?.markAsTouched();
      this.City?.markAsTouched();
      this.Zip?.markAsTouched();
    }

    this.triggerAnimation();
  }

  getValues() {
    const { data_input_field_1, data_input_field_2, data_input_field_3, ...restValues } = this.formGroup.value;
    return {
      ...restValues,
      firstName: this.FirstName?.value,
      lastName: this.LastName?.value,
      address: this.Address?.value,
      apt: this.Apt?.value,
      pin: this.Pin?.value,
    };
  }

  validateCard() {
    const card = this.localStorageDataService.getUserCardOrEmailValue().cardOrEmailValue;

    this.validate(this.cardNum?.value, card);
  }

  onOtpChange(data: any) {
    this.formGroup.patchValue({
      pin: data,
    });

    this.formGroup.updateValueAndValidity();
  }

  validate(matbiaCardNum: any, _emailValue: any) {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.matbiaCardAPI.validateCard(matbiaCardNum).subscribe(
      (res: ValidateCardResponse) => {
        if (res.status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
          if (!res.entityId) {
            this.entityId = '';
            return;
          }
          this.entityId = res.entityId || '';
          let values = this.getValues();

          values = {
            ...values,
            entityId: res.entityId,
            cardId: res.cardId,
          };
          this.profileValue.emit({ values: values, cardId: null });
          return;
        } else {
          if (res.status === MATBIA_CARD_STATUS.EMAIL_CARD_EXISTS) return;
          this.notificationService.showSuccess(res.status);
          let values = this.getValues();

          this.profileValue.emit({ values: values, cardId: res.cardId });
        }
      },
      () => {}
    );
  }
}
