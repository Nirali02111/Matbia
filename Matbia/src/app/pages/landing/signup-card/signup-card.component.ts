import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Params } from '@enum/Params';
import { AbstractControlWarning, CustomValidator } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AuthService } from '@services/API/auth.service';
import { DonorAPIService } from '@services/API/donor-api.service';
import { USPSService } from '@services/usps.service';
import { USPSResponsePopupComponent } from '@matbia/matbia-usps/uspsresponse-popup/uspsresponse-popup.component';
import { LandingModuleService } from '../landing-module.service';
import { SignupConfirmPopupComponent } from '../popup/signup-confirm-popup/signup-confirm-popup.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';
import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';

@Component({
  selector: 'app-signup-card',
  templateUrl: './signup-card.component.html',
  styleUrls: ['./signup-card.component.scss'],
  imports: [SharedModule, PhoneInputComponent, AddressAutocompleteDirective],
})
export class SignupCardComponent implements OnInit, OnDestroy {
  private _isAnimate = false;
  isLoading = false;
  isResend = false;
  isAutoSuggestion = true;
  isInSetup = false;
  registerDonorCardSubmitted = false;

  isPersonal = true;
  isPrePaidSignup = false;
  registerDonorCard!: UntypedFormGroup;

  modalOptions?: NgbModalOptions;

  headerBackSubscription!: Subscription;

  modalObs = new Subject<{ isLoading: boolean }>();

  public pinConfig = {
    length: 4,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'form-control otp-input-password',
    containerClass: 'input-col col-lg-input pinnumber-row',
  };

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

  get PIN() {
    return this.registerDonorCard.get('pin');
  }

  get CardId() {
    return this.registerDonorCard.get('cardId');
  }

  get EntityId() {
    return this.registerDonorCard.get('entityId');
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

  constructor(
    private router: Router,
    protected title: Title,
    private activeRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private donorAPI: DonorAPIService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private uspsService: USPSService,
    public commonDataService: CommonDataService,
    private moduleService: LandingModuleService,
    private localStorageService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Register');

    this.initControls();
    this.activeRoute.queryParamMap.subscribe((params) => {
      const cardId = params.get(Params.CARD_ID);
      const cardEntityId = params.get(Params.CARD_ENTITY_ID);

      const isPrePaidAccount = params.get(Params.IS_PRE_PAID_ACCOUNT);

      if (params.get(Params.IS_IN_SETUP)) {
        this.isInSetup = true;
      }

      if (isPrePaidAccount) {
        this.Email?.clearValidators();
        this.Email?.setValidators(
          Validators.compose([CustomValidator.email(), CustomValidator.noHebrew(), Validators.required])
        );
        this.isPrePaidSignup = true;
      }

      if (cardId) {
        this.registerDonorCard.patchValue({
          cardId,
        });

        this.registerDonorCard.updateValueAndValidity();
      }

      if (cardEntityId) {
        this.registerDonorCard.patchValue({
          entityId: cardEntityId,
        });

        this.registerDonorCard.updateValueAndValidity();
      }
    });

    this.headerBackSubscription = this.moduleService.getHeaderBack().subscribe(() => {
      this.isPersonal = false;
    });
  }

  ngOnDestroy(): void {
    this.headerBackSubscription.unsubscribe();
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
      cardId: this.fb.control('', Validators.compose([Validators.required])),
      entityId: this.fb.control(''),
      pin: this.fb.control('', Validators.compose([Validators.required, Validators.minLength(4)])),
    });
  }

  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }

  onRegister() {
    if (this.registerDonorCardSubmitted == true) {
      return;
    }

    this.resettingUSPSError();
    if (this.registerDonorCard.invalid) {
      this.triggerAnimation();
      this.registerDonorCard.markAllAsTouched();
      // remove EntityId
      if (this.CardId?.invalid) {
        this.notificationService.showError('CardId missing from url', 'Invalid Url Error!');
        return;
      }
      return;
    }
    this.registerDonorCardSubmitted = true;
    this.onAddressValidate();
  }

  doSubmitAction() {
    if (this.isPrePaidSignup) {
      this.doUpdateAction();
      return;
    }

    this.doRegistrationAction();
  }

  private doUpdateAction() {
    this.isLoading = true;
    const formData = {
      ...this.registerDonorCard.value,
      email: this.Email?.value || null,
      firstName: this.FirstName?.value,
      lastName: this.LastName?.value,
      address: this.Address?.value,
    };

    this.donorAPI.register(formData).subscribe(
      (res) => {
        if (res) {
          if (res.errors && res.errors.length > 0) {
            this.isLoading = false;
            this.notificationService.showError(res.errors[0].error, 'Error !');
            return;
          }

          if (res.success) {
            this.prePaidFlow(this.Email?.value, res.userHandle);
          }
        }
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  private doRegistrationAction() {
    this.isLoading = true;
    const formData = {
      ...this.registerDonorCard.value,
      email: this.Email?.value || null,
      firstName: this.FirstName?.value,
      lastName: this.LastName?.value,
      address: this.Address?.value,
    };

    this.donorAPI.register(formData).subscribe(
      (res) => {
        this.isLoading = false;

        if (res) {
          if (res.errors && res.errors.length > 0) {
            this.notificationService.showError(res.errors[0].error, 'Error !');
            return;
          }

          if (res.success) {
            this.goToSetupCardSetting(res.userHandle);
          }
        }
      },
      (err) => {
        this.isLoading = false;
        this.registerDonorCardSubmitted = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  private prePaidFlow(email: string, userHandle: string) {
    this.authService
      .matbiaCardLogin({ cardId: this.CardId?.value, pin: this.PIN?.value })
      .pipe(
        map((data) => data),
        switchMap((data) => {
          this.localStorageService.setLoginUserDataAndToken(data);

          return this.authService.shulKioskSetPassword({
            email: email,
            userHandle: userHandle,
          });
        })
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.router.navigate(['/'], {});
          this.openConfirmPopup(this.Email?.value);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  onAddressValidate() {
    this.isLoading = true;

    if (!this.zipCodeValidation) {
      this.doSubmitAction();
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

          this.doSubmitAction();
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

  goToSetupCardSetting(userHandle: string) {
    this.authService.matbiaCardLogin({ cardId: this.CardId?.value, pin: this.PIN?.value }).subscribe(
      (res) => {
        this.localStorageService.setLoginUserDataAndToken(res);
        this.router.navigate(['setup-card-setting'], {
          queryParams: { userHandle },
          queryParamsHandling: 'merge',
        });
      },
      () => {}
    );
  }

  displayLabelState() {
    const obj = this.commonDataService.stateList.find((o) => o.item_id === this.State?.value);
    return obj ? obj.item_text : '';
  }

  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
  }

  onBusinessCreate() {
    this.router.navigate(['setup-business'], {
      queryParamsHandling: 'preserve',
    });
  }

  onOtpChange(data: any) {
    this.PIN?.markAsTouched();
    this.registerDonorCard.patchValue({
      pin: data,
    });

    this.registerDonorCard.updateValueAndValidity();
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
    this.modalOptions = {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'usps-modal-main',
    };
    const modal = this.modalService.open(USPSResponsePopupComponent, this.modalOptions);

    if (uspsResponse) {
      modal.componentInstance.isDifferentResponse = true;

      modal.componentInstance.address = uspsResponse.uspsAddress;
      modal.componentInstance.city = uspsResponse.uspsCity;
      modal.componentInstance.state = uspsResponse.uspsState;
      modal.componentInstance.zip = uspsResponse.uspsZip;

      modal.closed.subscribe((closeDescription: string) => {
        if (closeDescription) {
          this.doSubmitAction();
        }
      });
      modal.componentInstance.continueOnNewAddress.subscribe(() => {
        const formattedAddress = this.uspsService.removeAPTfromAddress(uspsResponse.uspsAddress);
        this.Address?.patchValue(formattedAddress);
        this.City?.patchValue(uspsResponse.uspsCity);
        this.State?.patchValue(uspsResponse.uspsState);
        this.Zip?.patchValue(uspsResponse.uspsZip);

        this.doSubmitAction();
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
      this.doSubmitAction();
    });
  }

  tmpBusiness(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openConfirmPopup(email: string) {
    const modal = this.modalService.open(SignupConfirmPopupComponent, {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'signup-card-confirm-popup',
    });

    modal.componentInstance.email = email;

    modal.closed.subscribe(() => {
      this.isResend = false;
    });
  }
}
