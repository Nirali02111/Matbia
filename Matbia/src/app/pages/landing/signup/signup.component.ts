import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '@enum/Params';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { DonorProfileFormGroupComponent } from '@matbia/matbia-form-group/donor-profile-form-group/donor-profile-form-group.component';
import { DonorAPIService } from '@services/API/donor-api.service';
import { Subject, Subscription } from 'rxjs';
import { SignupConfirmPopupComponent } from '../popup/signup-confirm-popup/signup-confirm-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '@commons/notification.service';
import { OrganizationProfileFormGroupComponent } from '@matbia/matbia-form-group/organization-profile-form-group/organization-profile-form-group.component';
import { OrganizationAPIService, SaveOrganizationPayload } from '@services/API/organization-api.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { RegisterErrorPopupComponent } from '../../user-panel/popups/register-error-popup/register-error-popup.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';
import { SharedModule } from '@matbia/shared/shared.module';
import { IsHebrewDirective } from '@matbia/matbia-directive/is-hebrew.directive';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';
import { RecaptchaLoaderService } from 'ng-recaptcha';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [
    SharedModule,
    DonorProfileFormGroupComponent,
    OrganizationProfileFormGroupComponent,
    IsHebrewDirective,
    ButtonLoaderComponent,
    AddressAutocompleteDirective,
  ],
  providers: [RecaptchaLoaderService],
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
  active = 1;

  isAutoSuggestion = true;
  isDonorSignupSubmitted = false;
  donorSignupFormGroup!: FormGroup;
  isOrgSignupSubmitted = false;
  orgSignupFormGroup!: FormGroup;

  isOrgSignUpDone = false;
  organizationDetails!: SaveOrganizationPayload;

  isResend = false;
  isLoading = false;
  disableSubmitOrganization: boolean = false;
  base64Image = '';
  orgSignUpTab: number = 2;
  modalObs = new Subject<{ isLoading: boolean }>();
  @ViewChild(DonorProfileFormGroupComponent, { static: false }) donorProfileSignup!: DonorProfileFormGroupComponent;
  @ViewChild(OrganizationProfileFormGroupComponent, { static: false })
  orgProfileSignup!: OrganizationProfileFormGroupComponent;
  emailExists: string = 'Email already exists in another account';
  headerText: string = '';

  private toastClickSubscription!: Subscription;

  constructor(
    protected title: Title,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NotificationService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private donorAPI: DonorAPIService,
    private organizationAPI: OrganizationAPIService
  ) {}

  ngOnInit(): void {
    this.toastClickSubscription = this.notification.toastClicked.subscribe((val) => {
      if (val) this.disableSubmitOrganization = false;
    });

    this.title.setTitle('Matbia - Register');
    this.initControl();
    this.activeRoute.url.subscribe((val) => {
      if (val.some((urlSegment) => urlSegment.path === PageRouteVariable.OrgSignupUrl)) this.active = this.orgSignUpTab;
    });
    this.activeRoute.queryParamMap.subscribe((params) => {
      const isShulKiosk = params.get(Params.SHUL_KIOSK);

      if (!isShulKiosk) {
        this.isAutoSuggestion = false;
      }

      const isActiveType = params.get('active');
      if (isActiveType) {
        this.active = +isActiveType;
      }

      const fromEntityId = params.get(Params.FROM_ENTITY_ID);
      if (fromEntityId) {
        this.orgSignupFormGroup.patchValue({
          fromEntityId: fromEntityId,
        });
        this.orgSignupFormGroup.updateValueAndValidity();
      }
    });

    const state = history.state;
    if (state?.text === 'prepaidCreateAccount') {
      this.headerText = 'You have a prepaid card with no online account. Please finish setting up your online account';
      this.donorSignupFormGroup.get('cardNum')?.addValidators(Validators.required);
      this.donorSignupFormGroup.get('pin')?.addValidators(Validators.required);
    } else {
      this.headerText = '';
      this.donorSignupFormGroup.get('cardNum')?.removeValidators(Validators.required);
      this.donorSignupFormGroup.get('pin')?.removeValidators(Validators.required);
    }
  }

  ngAfterViewInit(): void {}

  private initControl() {
    this.donorSignupFormGroup = this.matbiaFormGroupService.initDonorRegisterFormGroup({
      firstName: null,
      lastName: null,
      address: null,
      apt: null,
      city: null,
      state: null,
      zip: null,
      email: null,
      phone: null,
      cellPhone: null,

      isBusinessAccount: false,
      businessName: null,
      taxId: null,
      heardAboutUs: null,
      pin: null,
      cardNum: null,
    });

    this.orgSignupFormGroup = this.matbiaFormGroupService.initOrganizationRegisterFormGroup({
      dba: null,
      taxId: null,
      orgLegalName: null,
      yiddishDisplayName: null,
      displayName: null,
      email: null,
      phone: null,
      cellPhone: null,
      address: null,
      city: null,
      state: null,
      zip: null,

      legalAddress: null,
      legalCity: null,
      legalState: null,
      legalZip: null,

      orgLogoBase64: null,
      ownerIdAttachmentBase64: null,
      orgIdAttachmentBase64: null,

      ownerName: null,
      ownerPhoneNumber: null,
      ownerPhoneExt: null,
      ownerEmail: null,
      fromEntityId: null,
      isMailingAddress: false,
    });
  }

  ngOnDestroy(): void {
    if (this.toastClickSubscription) {
      this.toastClickSubscription.unsubscribe();
    }
  }

  onRegister() {
    this.isDonorSignupSubmitted = true;
    if (this.donorSignupFormGroup.invalid) {
      this.donorSignupFormGroup.markAllAsTouched();
      this.donorProfileSignup.triggerAnimation();
      return;
    }

    this.donorProfileSignup.onAddressValidate();
  }

  doSignUP(event: any = null) {
    let cardId: any;
    if (event?.cardId) {
      cardId = event.cardId;
    }
    event = event?.values;
    let values = this.donorProfileSignup.getValues();

    this.isLoading = true;
    this.modalObs.next({ isLoading: true });
    if (this.headerText !== '' && event == null) {
      this.donorProfileSignup.validateCard();
    } else {
      if (event) {
        values = event;
      }
      this.donorAPI.register(values).subscribe(
        (res) => {
          this.isLoading = false;
          this.modalObs.next({ isLoading: false });
          if (res) {
            if (res.errors && res.errors.length > 0) {
              this.notification.showError(res.errors[0].error, 'Error !');

              return;
            }

            if (res.success) {
              if (!this.isResend) {
                if (this.headerText == '') {
                  this.openConfirmPopup(values.email);
                }
                if (event) {
                  const validateAPIRes = {
                    cardId: cardId ? cardId : event.cardId,
                    pin: event.pin,
                    email: event.email,
                  };
                  this.router.navigate(['/send-me-email'], {
                    state: {
                      tmpName: 'checkEmailTmp2',
                      accountemail: event.email,
                      isRedirectFromSignUp: validateAPIRes,
                      showValidatecard: true,
                      SignUpcardNum: this.donorSignupFormGroup.get('cardNum')?.value,
                    },
                  });
                  return;
                }
                this.router.navigate(['/']);
              }
            }
          }
        },
        (err) => {
          this.isLoading = false;
          const normalizedMessage = err?.error?.toLowerCase().replace(/\s+/g, '');
          if (normalizedMessage.includes('emailalreadyexistsinanotheraccount')) {
            this.modalObs.next({ isLoading: false });
            const modalRef = this.modalService.open(RegisterErrorPopupComponent, {
              centered: true,
              backdrop: 'static',
              keyboard: false,
              windowClass: 'modal-main modal-email-error',
              size: 'md',
              scrollable: true,
              fullscreen: 'md',
            });
            modalRef.componentInstance.email = this.donorSignupFormGroup.get('email')?.value;
          } else {
            this.notification.showError(err.error, 'Error !');
          }
        }
      );
    }
  }

  openConfirmPopup(email: string) {
    const modal = this.modalService.open(SignupConfirmPopupComponent, {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'signup-card-confirm-popup',
    });

    modal.componentInstance.email = email;
    modal.componentInstance.modalObs = this.modalObs;

    modal.closed.subscribe(() => {
      this.isResend = false;
    });

    modal.componentInstance.resendEvent.subscribe(() => {
      this.isResend = true;
      this.doSignUP();
    });
  }

  onOrgRegister() {
    this.isOrgSignupSubmitted = true;
    if (this.orgSignupFormGroup.invalid) {
      this.orgSignupFormGroup.markAllAsTouched();
      this.orgProfileSignup.triggerAnimation();
      return;
    }

    this.orgProfileSignup.onAddressValidate();
  }

  doOrgSignUP() {
    this.organizationDetails = this.orgProfileSignup.getValues();
    this.base64Image = this.orgProfileSignup.orgIcon;

    this.isLoading = true;

    this.modalObs.next({ isLoading: true });
    this.organizationAPI.saveOrganization(this.organizationDetails).subscribe(
      () => {
        this.isLoading = false;
        this.modalObs.next({ isLoading: false });
        this.isOrgSignUpDone = true;
      },
      (err) => {
        this.disableSubmitOrganization = true;
        this.isLoading = false;
        this.modalObs.next({ isLoading: false });
        this.notification.showError(err.error, 'Error !');
      }
    );
  }
}
