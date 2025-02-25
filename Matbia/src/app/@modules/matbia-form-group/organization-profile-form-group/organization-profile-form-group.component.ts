import { AfterContentInit, Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { shakeTrigger } from '@commons/animations';
import { CommonDataService } from '@commons/common-data-service.service';
import { AbstractControlWarning } from '@commons/custom-validator';
import { Assets } from '@enum/Assets';
import { USPSResponsePopupComponent } from '@matbia/matbia-usps/uspsresponse-popup/uspsresponse-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveOrganizationPayload } from '@services/API/organization-api.service';
import { USPSService } from '@services/usps.service';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';
import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-organization-profile-form-group',
  templateUrl: './organization-profile-form-group.component.html',
  styleUrls: ['./organization-profile-form-group.component.scss'],
  imports: [SharedModule, PhoneInputComponent, InputErrorComponent, AddressAutocompleteDirective],
  animations: [shakeTrigger],
})
export class OrganizationProfileFormGroupComponent implements OnInit, AfterContentInit {
  private _isAnimate = false;

  employerIdMask = '00-0000000';

  phoneEXTMask = '999-999-9999';

  legalZipCodeMask: string = '00000';
  legalZipCodeValidation = true;

  zipCodeMask: string = '00000';
  zipCodeValidation = true;

  @Input() orgIcon = Assets.PROFILE_IMAGE;

  @Input() formGroup!: UntypedFormGroup;

  @Input() isAutoSuggestion!: boolean;

  @Input() isSubmitted = false;

  @Output() canCallAPI: EventEmitter<boolean> = new EventEmitter();

  get DbaName() {
    return this.formGroup.get('dba');
  }

  get TaxId() {
    return this.formGroup.get('taxId');
  }

  get OrgLegalName(): AbstractControlWarning | null {
    return this.formGroup.get('orgLegalName');
  }

  get YiddishDisplayName() {
    return this.formGroup.get('yiddishDisplayName');
  }

  get DisplayName() {
    return this.formGroup.get('displayName');
  }

  get Address(): AbstractControlWarning | null {
    return this.formGroup.get('data_input_field_1');
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

  get LegalAddress(): AbstractControlWarning | null {
    return this.formGroup.get('data_input_field_2');
  }

  get LegalCity() {
    return this.formGroup.get('legalCity');
  }

  get LegalState() {
    return this.formGroup.get('legalState');
  }

  get LegalZip() {
    return this.formGroup.get('legalZip');
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

  get OwnerName() {
    return this.formGroup.get('ownerName');
  }

  get OwnerPhoneNumber() {
    return this.formGroup.get('ownerPhoneNumber');
  }

  get OwnerPhoneExt() {
    return this.formGroup.get('ownerPhoneExt');
  }

  get OwnerEmail() {
    return this.formGroup.get('ownerEmail');
  }

  /**
   * Org logo form group
   */

  get OrgLogoImage() {
    return this.formGroup.get('orgLogoImage');
  }

  get OrgLogoFileName() {
    return this.OrgLogoImage?.get('orgLogoFileName');
  }

  get OrgLogoBase64() {
    return this.OrgLogoImage?.get('orgLogoBase64');
  }

  /**
   * Owner Id form group
   */

  get OwnerIdAttachment() {
    return this.formGroup.get('ownerIdAttachment');
  }

  get OwnerIdAttachmentFileName() {
    return this.OwnerIdAttachment?.get('ownerIdAttachmentFileName');
  }

  get OwnerIdAttachmentBase64() {
    return this.OwnerIdAttachment?.get('ownerIdAttachmentBase64');
  }

  /**
   * Org Id form group
   */
  get OrgIdAttachment() {
    return this.formGroup.get('orgIdAttachment');
  }

  get OrgIdAttachmentFileName() {
    return this.OrgIdAttachment?.get('orgIdAttachmentFileName');
  }

  get OrgIdAttachmentBase64() {
    return this.OrgIdAttachment?.get('orgIdAttachmentBase64');
  }

  get IsAnimate() {
    return this._isAnimate;
  }

  get IsMailingAddress() {
    return this.formGroup.get('isMailingAddress');
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    public commonDataService: CommonDataService,
    private uspsService: USPSService
  ) {}

  ngOnInit(): void {
    this.IsMailingAddress?.valueChanges.subscribe((val) => {
      if (val) {
        this.addMailAddress();
        return;
      }
      this.clearMailAddress();
      return;
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }

  /**
   * Organization Logo attachment
   * @param event
   */

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const selectedFile = event.target.files[0];
      this.OrgLogoFileName?.patchValue(selectedFile.name);
      this.OrgLogoFileName?.updateValueAndValidity();
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = this.handleReaderLoaded.bind(this);
    }
  }

  handleReaderLoaded(e: any) {
    this.orgIcon = e.target.result;
    const base64textString = (e.target.result || 'base64,').split('base64,')[1];

    this.OrgLogoBase64?.patchValue(base64textString);
    this.OrgLogoBase64?.updateValueAndValidity();
    this.OrgLogoImage?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  removeImage() {
    this.orgIcon = Assets.PROFILE_IMAGE;
    this.OrgLogoFileName?.patchValue('');
    this.OrgLogoBase64?.patchValue('');
  }

  /**
   * Owner Id attachment
   * @param Event
   * @returns
   */

  onOwnerPhotoIdChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const selectedFile = event.target.files[0];
      this.OwnerIdAttachmentFileName?.patchValue(selectedFile.name);
      this.OwnerIdAttachmentFileName?.updateValueAndValidity();
      this.OwnerIdAttachment?.updateValueAndValidity();
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = this.ownerPhotoIdHandleReaderLoaded.bind(this);
    }
  }

  ownerPhotoIdHandleReaderLoaded(e: any) {
    const base64textString = (e.target.result || 'base64,').split('base64,')[1];
    this.OwnerIdAttachmentBase64?.patchValue(base64textString);
    this.OwnerIdAttachmentBase64?.updateValueAndValidity();
    this.OwnerIdAttachment?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  removeOwnerDocuments() {
    this.OwnerIdAttachmentFileName?.patchValue('');
    this.OwnerIdAttachmentBase64?.patchValue('');
    this.OwnerIdAttachment?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  /**
   * Organization Id attachment
   * @param Event
   * @returns
   */

  onOrgIdAttachmentChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const selectedFile = event.target.files[0];
      this.OrgIdAttachmentFileName?.patchValue(selectedFile.name);
      this.OrgIdAttachmentFileName?.updateValueAndValidity();
      this.OrgIdAttachment?.updateValueAndValidity();
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = this.OrgIdAttachmentHandleReaderLoaded.bind(this);
    }
  }

  OrgIdAttachmentHandleReaderLoaded(e: any) {
    const base64textString = (e.target.result || 'base64,').split('base64,')[1];
    this.OrgIdAttachmentBase64?.patchValue(base64textString);
    this.OrgIdAttachmentBase64?.updateValueAndValidity();
    this.OwnerIdAttachment?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  removeOrgIdDocuments() {
    this.OrgIdAttachmentFileName?.patchValue('');
    this.OrgIdAttachmentBase64?.patchValue('');
    this.OrgIdAttachment?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
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
      data_input_field_1: streetAddress,
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

  onLegalAddressChange(data: any) {
    if (data.notFound) {
      this.isSubmitted = true;
      this.LegalAddress?.setErrors({
        googleMapError: data.notFound,
      });

      this.LegalAddress?.markAsTouched();

      this.triggerAnimation();
      return;
    }

    let streetAddress = data.streetName;

    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }

    this.formGroup.patchValue({
      data_input_field_2: streetAddress,
      legalCity: data.locality.long || data.locality.short || data.sublocality,
      legalState: data.state.short,
      legalZip: data.postalCode,
    });

    if (!data?.country?.isFromUSA) {
      this.legalZipCodeMask = '';
      this.legalZipCodeValidation = false;
      this.LegalZip?.clearValidators();
      this.LegalZip?.updateValueAndValidity();
    }

    if (data?.country?.isFromUSA) {
      this.legalZipCodeMask = '00000';
      this.legalZipCodeValidation = true;
      this.LegalZip?.clearValidators();
      this.LegalZip?.setValidators(
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      );
      this.LegalZip?.updateValueAndValidity();
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
  }

  onAddressValidate() {
    if (!this.zipCodeValidation) {
      this.canCallAPI.emit(true);
      return;
    }

    const address = this.uspsService.getAddressWithAPT(this.Address?.value, '');

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
      this.uspsService.isErrorOnZip(description)
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

  getValues(): SaveOrganizationPayload {
    const { orgLogoImage, ownerIdAttachment, orgIdAttachment, data_input_field_1, data_input_field_2, ...allValues } =
      this.formGroup.value;

    return {
      ...allValues,
      address: this.Address?.value,
      legalAddress: this.LegalAddress?.value,
      orgLogoBase64: this.OrgLogoBase64?.value,
      ownerIdAttachmentBase64: this.OwnerIdAttachmentBase64?.value,
      orgIdAttachmentBase64: this.OrgIdAttachmentBase64?.value,
    };
  }

  addMailAddress() {
    let address = this.LegalAddress?.value;
    let city = this.LegalCity?.value;
    let state = this.LegalState?.value;
    let zip = this.LegalZip?.value;

    this.Address?.patchValue(address);
    this.City?.patchValue(city);
    this.State?.patchValue(state);
    this.Zip?.patchValue(zip);
  }

  clearMailAddress() {
    this.Address?.patchValue(null);
    this.City?.patchValue(null);
    this.State?.patchValue(null);
    this.Zip?.patchValue(null);
  }
}
