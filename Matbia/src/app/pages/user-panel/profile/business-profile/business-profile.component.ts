import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Assets } from '@enum/Assets';

import { NotificationService } from '@commons/notification.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AbstractControlWarning, CustomValidator } from '@commons/custom-validator';

import { USPSService } from '@services/usps.service';
import { OrgObj, OrganizationAPIService } from '@services/API/organization-api.service';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';

import { PanelPopupsService } from '../../popups/panel-popups.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { BusinessRegisterFormGroupComponent } from '@matbia/matbia-form-group/business-register-form-group/business-register-form-group.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';
import { SharedModule } from '@matbia/shared/shared.module';
import { APIKeyComponent } from '@matbia/matbia-directive/components/apikey/apikey.component';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { AccountHashComponent } from '@matbia/matbia-directive/components/account-hash/account-hash.component';
import { CustomDonateURLComponent } from '@matbia/matbia-directive/components/custom-donate-url/custom-donate-url.component';

@Component({
  selector: 'app-business-profile',
  templateUrl: './business-profile.component.html',
  styleUrls: ['./business-profile.component.scss'],
  imports: [SharedModule, APIKeyComponent, PhoneInputComponent, AddressAutocompleteDirective, AccountHashComponent, CustomDonateURLComponent],
})
export class BusinessProfileComponent implements OnInit, AfterViewChecked {
  profileIcon = Assets.PROFILE_IMAGE;

  isDevEnv = false;

  private _isAnimate = false;
  isLoading = false;
  isAutoSuggestion = true;
  registerDonorCardSubmitted = false;

  orgProfileResponse!: OrgObj;

  registerDonorCard!: UntypedFormGroup;

  businessForm!: UntypedFormGroup;

  imageUrl!: string;

  zipCodeMask: string = '00000';
  zipCodeValidation = true;
  isbusinessSetup = false;

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

  get OrgName(): AbstractControlWarning | null {
    return this.businessForm?.get('businessName');
  }

  get OrgYiddishName(): AbstractControlWarning | null {
    return this.businessForm?.get('orgJewishName');
  }

  get OrgHandle() {
    return this.businessForm?.get('orgHandle');
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
      (this.Email?.touched && this.Email?.errors?.hebrewFound) ||
      (this.OrgName?.touched && this.OrgName?.errors?.hebrewFound)
    );
  }

  @ViewChild('businessRegisterForm') businessRegisterForm!: BusinessRegisterFormGroupComponent;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private notificationService: NotificationService,
    private uspsService: USPSService,
    private localStorage: LocalStorageDataService,
    public commonDataService: CommonDataService,
    public panelPopupService: PanelPopupsService,
    private matbiaObserver: MatbiaObserverService,
    private notification: NotificationService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private organizationAPI: OrganizationAPIService
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

    this.getOrganizationDetails();
  }

  ngAfterViewChecked(): void {
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
      orgLogo: this.fb.group({
        fileName: this.fb.control(''),
        fileBase64: this.fb.control(''),
      }),
    });
    this.businessForm = this.matbiaFormGroupService.initBusinessRegister({
      businessType: '',
      naics: '',
      naicsCode: null,
      businessName: '',
      orgJewishName: '',
      address: '',
      city: '',
      state: null,
      zip: '',
      employerId: '',
      businessEmail: '',
      phone: '',
      officePhone: '',
      doingBusinessAs: '',
      businessWebsite: null,
    });

    this.businessForm.addControl('orgHandle', this.fb.control('', Validators.compose([Validators.required])));

    this.businessForm.addControl(
      'orgLogo',
      this.fb.group({
        fileName: this.fb.control(''),
        fileBase64: this.fb.control(''),
      })
    );
  }

  initBusinessForm() {
    this.businessForm = this.matbiaFormGroupService.initBusinessRegister({
      businessType: '',
      naics: '',
      naicsCode: null,
      businessName: '',
      address: '',
      city: '',
      state: null,
      zip: '',
      employerId: '',
      businessEmail: '',
      phone: '',
      officePhone: '',
      doingBusinessAs: '',
      businessWebsite: null,
      orgJewishName: null,
    });

    this.businessForm.addControl('orgHandle', this.fb.control('', Validators.compose([Validators.required])));

    this.businessForm.addControl(
      'profileImage',
      this.fb.group({
        fileName: this.fb.control(''),
        fileBase64: this.fb.control(''),
      })
    );
  }

  getOrganizationDetails(needToUpdateLocal = false) {
    const businessHandle = this.localStorage.getLoginUserUserName();

    this.isLoading = true;
    this.organizationAPI.getOrganizationByUsername(businessHandle).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.businessForm.patchValue({
            businessType: res.businessType,

            naicsCode: res.naicsCode,
            businessName: res.displayName,
            orgJewishName: res.orgJewishName,
            doingBusinessAs: res.doingBusinessAs,
            businessWebsite: res.businessWebsite,

            address: res.address,
            city: res.city,
            state: res.state,
            zip: res.zip,
            employerId: res.employerId,
            businessEmail: res.email,

            phone: res.phone,
            officePhone: res.officePhone,

            orgHandle: res.orgHandle,
          });

          this.registerDonorCard.patchValue({
            data_input_field_3: res.mailing.address,
            apt: res.mailing.apt,
            city: res.mailing.city,
            state: res.mailing.state,
            zip: res.mailing.zip,
            email: res.email,
            phone: res.officePhone,
            cellPhone: res.phone,
          });

          if (res.orgLogo) {
            this.imageUrl = res.orgLogo;
          }

          this.registerDonorCard.updateValueAndValidity();
          this.businessForm.updateValueAndValidity();

          if (needToUpdateLocal) {
            this.localStorage.setBusinessName({ businessName: res.businessName });
          }
          this.registerDonorCard.updateValueAndValidity();
          this.businessForm.updateValueAndValidity();
          this.orgProfileResponse = res;
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
    if (this.OrgName?.invalid) {
      this.registerDonorCardSubmitted = true;
      this.triggerAnimation();
      this.registerDonorCard.markAllAsTouched();
      this.businessForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.organizationAPI
      .update({
        ...this.businessForm.value,
        businessName: this.businessForm.value.businessName,
        entityName: this.OrgName?.value,
        naicsCode: this.businessForm.get('naicsCode')?.value,
        orgLogo: this.registerDonorCard.get('orgLogo')?.value,

        address: this.Address?.value,
        address2: this.Apt?.value,
        city: this.City?.value,
        state: this.State?.value,
        zip: this.Zip?.value,
        officePhone: this.Phone?.value,
        phone: this.Cellphone?.value,

        email: this.Email?.value || null,
      })
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.errors && response.errors.length > 0) {
            this.notificationService.showError(response.errors[0].error, 'Error!');
            return;
          }

          if (response.success) {
            this.notificationService.showSuccess(response.message);
            this.getOrganizationDetails(true);
          }
        },
        (error) => {
          this.isLoading = false;
          this.notificationService.showError(error.error, 'Error!');
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

  onBusinessUpdate() {
    this.businessRegisterForm.setIsSubmitted();

    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      this.businessRegisterForm.triggerAnimation();
      return;
    }

    this.isLoading = true;
    this.organizationAPI
      .update({
        ...this.businessForm.value,
        naicsCode: +this.businessForm.get('naicsCode')?.value,
      })
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.errors && response.errors.length > 0) {
            this.notification.showError(response.errors[0].error, 'Error!');
            return;
          }

          if (response.success) {
            this.isbusinessSetup = true;
            this.notification.showSuccess(response.message);
          }
        },
        (error) => {
          this.isLoading = false;
          this.notification.showError(error.error, 'Error!');
        }
      );
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

  getPhoneNumberAsNumber(phoneNumber: any): number | string {
    if (phoneNumber == null) {
      return '';
    }
    return +phoneNumber;
  }
}
