import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { Assets } from '@enum/Assets';

import { NotificationService } from '@commons/notification.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AbstractControlWarning, CustomValidator } from '@commons/custom-validator';

import { USPSService } from '@services/usps.service';
import { DonorAPIService } from '@services/API/donor-api.service';

import { PanelPopupsService } from '../../popups/panel-popups.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';

import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-donor-profile',
  templateUrl: './donor-profile.component.html',
  styleUrls: ['./donor-profile.component.scss'],
  imports: [SharedModule, PhoneInputComponent, AddressAutocompleteDirective],
})
export class DonorProfileComponent implements OnInit, AfterViewChecked {
  profileIcon = Assets.PROFILE_IMAGE;

  isDevEnv = false;

  private _isAnimate = false;
  isLoading = false;
  isAutoSuggestion = true;
  registerDonorCardSubmitted = false;
  registerDonorCard!: UntypedFormGroup;

  imageUrl!: string;

  zipCodeMask: string = '00000';
  zipCodeValidation = true;

  get FirstName(): AbstractControlWarning | null {
    return this.registerDonorCard.get('data_input_field_1');
  }

  get LastName(): AbstractControlWarning | null {
    return this.registerDonorCard.get('data_input_field_2');
  }

  get Address(): AbstractControlWarning | null {
    return this.registerDonorCard.get('data_input_field_3');
  }

  get Apt() {
    return this.registerDonorCard.get('apt');
  }

  get City(): AbstractControlWarning | null {
    return this.registerDonorCard.get('city');
  }

  get State() {
    return this.registerDonorCard.get('state');
  }

  get Zip() {
    return this.registerDonorCard.get('zip');
  }

  get Email(): AbstractControlWarning | null {
    return this.registerDonorCard.get('email');
  }

  get Phone() {
    return this.registerDonorCard.get('phone');
  }

  get Cellphone() {
    return this.registerDonorCard.get('cellPhone');
  }

  get OrgLogo() {
    return this.registerDonorCard.get('orgLogo');
  }

  get OrgLogoName() {
    return this.OrgLogo?.get('fileName');
  }

  get OrgLogoBase64() {
    return this.OrgLogo?.get('fileBase64');
  }

  get isBusinessView() {
    return this.localStorage.isBusiness() || this.localStorage.isOrganization() ? true : false;
  }

  get IsAnimate() {
    return this._isAnimate;

    return (
      this._isAnimate ||
      (this.FirstName?.touched && this.FirstName?.errors?.hebrewFound) ||
      (this.LastName?.touched && this.LastName?.errors?.hebrewFound) ||
      (this.Address?.touched && this.Address?.errors?.hebrewFound) ||
      (this.City?.touched && this.City?.errors?.hebrewFound) ||
      (this.Email?.touched && this.Email?.errors?.hebrewFound)
    );
  }

  get BusinessName(): AbstractControlWarning | null {
    return this.registerDonorCard.get('businessName');
  }

  get TaxId(): AbstractControlWarning | null {
    return this.registerDonorCard.get('taxId');
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private donorAPI: DonorAPIService,
    private notificationService: NotificationService,
    private uspsService: USPSService,
    private localStorage: LocalStorageDataService,
    public commonDataService: CommonDataService,
    public panelPopupService: PanelPopupsService,
    private matbiaObserver: MatbiaObserverService,

    private router: Router,
    private pageRoute: PageRouteVariable
  ) {}

  ngOnInit(): void {
    this.initControls();

    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      if (val) {
        this.Email?.clearValidators();
        this.registerDonorCard.updateValueAndValidity();
        return;
      }

      this.Email?.clearValidators();
      this.Email?.setValidators(
        Validators.compose([Validators.required, CustomValidator.email(), CustomValidator.noHebrew()])
      );
      this.registerDonorCard.updateValueAndValidity();
      return;
    });

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    this.getDonorData();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  private removeBusinessValidation() {
    this.BusinessName?.clearValidators();
    this.BusinessName?.updateValueAndValidity();

    this.registerDonorCard.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  private removeTaxValidation() {
    this.TaxId?.clearValidators();
    this.TaxId?.updateValueAndValidity();

    this.registerDonorCard.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  initControls() {
    this.registerDonorCard = this.fb.group({
      data_input_field_1: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      data_input_field_2: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      data_input_field_3: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      apt: this.fb.control(''),
      city: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      state: this.fb.control(null, Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      zip: this.fb.control(
        '',
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      ),
      email: this.fb.control('', Validators.compose([CustomValidator.email(), CustomValidator.noHebrew()])),
      phone: this.fb.control('', Validators.compose([])),
      cellPhone: this.fb.control('', Validators.compose([Validators.required])),
      businessName: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      taxId: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),

      orgLogo: this.fb.group({
        fileName: this.fb.control(''),
        fileBase64: this.fb.control(''),
      }),
    });
  }

  getDonorData(needToUpdateLocal = false) {
    this.isLoading = true;
    const username = this.localStorage.getLoginUserUserName();
    this.donorAPI.get(username).subscribe(
      (res) => {
        this.isLoading = false;

        if (res) {
          this.registerDonorCard.patchValue({
            data_input_field_1: res.firstName,
            data_input_field_2: res.lastName,
            data_input_field_3: res.address,
            apt: res.apt,
            city: res.city,
            state: res.state,
            zip: res.zip,
            email: res.email,
            phone: res.phone,
            cellPhone: res.cellPhone,
            businessName: res.businessName,
            taxId: res.taxId,
          });

          if (!res.taxId) {
            this.removeTaxValidation();
          }

          if (!res.businessName) {
            this.removeBusinessValidation();
          }

          if (res.orgLogo) {
            this.imageUrl = res.orgLogo;
          }

          this.registerDonorCard.updateValueAndValidity();

          if (needToUpdateLocal) {
            this.localStorage.setFirstNameAndLastName({ firstName: res.firstName, lastName: res.lastName });
          }
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }

  onUpdate() {
    this.registerDonorCardSubmitted = true;
    this.resettingUSPSError();
    if (this.registerDonorCard.invalid) {
      this.triggerAnimation();
      this.registerDonorCard.markAllAsTouched();
      return;
    }

    this.onAddressValidate();
  }

  callUpdateAPI() {
    this.isLoading = true;

    const username = this.localStorage.getLoginUserUserName();
    const updatedBy = this.localStorage.getLoginUserId();
    const formData = {
      ...this.registerDonorCard.value,
      email: this.Email?.value || null,
      firstName: this.FirstName?.value,
      lastName: this.LastName?.value,
      address: this.Address?.value,
      userHandle: username,
      updatedBy,
    };

    this.donorAPI.update(formData).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (res.errors && res.errors.length !== 0) {
            this.notificationService.showError(res.errors[0].error, 'Error !');
            return;
          }

          this.notificationService.showSuccess(res.message);
          this.getDonorData(true);
          let isRedirectFromVoucher = this.localStorage.getIsRedirectFromVoucherPage();
          if (isRedirectFromVoucher == 'true') {
            this.localStorage.setIsRedirectFromVoucherPage('false');
            this.router.navigate(this.pageRoute.getOrderTokenBookRouterLink());
          }
        }
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  onAddressValidate() {
    this.isLoading = true;

    if (!this.zipCodeValidation) {
      this.callUpdateAPI();
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
        this.isLoading = false;
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

          this.callUpdateAPI();
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('error', err);
      }
    );
  }

  onAddressChange(data: any) {
    if (data.notFound) {
      this.registerDonorCardSubmitted = true;
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

    this.registerDonorCard.patchValue({
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

    this.resetAPTFieldError();

    this.registerDonorCard.updateValueAndValidity();
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

  resetAPTFieldError() {
    if (this.Apt?.errors) {
      const { uspsError, ...errors } = this.Apt?.errors;
      this.Apt?.setErrors(errors);
      this.Apt.clearValidators();
      this.Apt?.updateValueAndValidity();
    }
  }

  displayLabelState() {
    const obj = this.commonDataService.stateList.find((o) => o.item_id === this.State?.value);
    return obj ? obj.item_text : '';
  }

  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
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
    const modal = this.panelPopupService.openUSPSContinue();

    if (uspsResponse) {
      modal.componentInstance.isDifferentResponse = true;

      modal.componentInstance.address = uspsResponse.uspsAddress;
      modal.componentInstance.city = uspsResponse.uspsCity;
      modal.componentInstance.state = uspsResponse.uspsState;
      modal.componentInstance.zip = uspsResponse.uspsZip;

      modal.closed.subscribe((closeDescription: string) => {
        if (closeDescription) {
          this.callUpdateAPI();
        }
      });
      modal.componentInstance.continueOnNewAddress.subscribe(() => {
        const formattedAddress = this.uspsService.removeAPTfromAddress(uspsResponse.uspsAddress);
        this.Address?.patchValue(formattedAddress);
        this.City?.patchValue(uspsResponse.uspsCity);
        this.State?.patchValue(uspsResponse.uspsState);
        this.Zip?.patchValue(uspsResponse.uspsZip);

        this.callUpdateAPI();
      });

      return;
    }

    modal.componentInstance.description = description;
    modal.componentInstance.isAPT = isAPT;
    modal.componentInstance.isAddress = isAddress;
    modal.closed.subscribe((closeDescription: string) => {
      if (closeDescription) {
        this.checkAddress(closeDescription);
      }
    });
    modal.componentInstance.continueOnAddress.subscribe(() => {
      this.callUpdateAPI();
    });
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

      this.registerDonorCard.patchValue({
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
    this.imageUrl = e.target.result;
    const base64textString = (e.target.result || 'base64,').split('base64,')[1];

    this.registerDonorCard.patchValue({
      orgLogo: {
        fileBase64: base64textString,
      },
    });
  }

  removeImage() {
    this.imageUrl = '';
    this.registerDonorCard.patchValue({
      orgLogo: {
        fileName: '',
        fileBase64: '',
      },
    });
  }
}
