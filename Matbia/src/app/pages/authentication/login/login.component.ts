import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecaptchaLoaderService, ReCaptchaV3Service } from 'ng-recaptcha';

import { Params } from '@enum/Params';
import { UserTypes } from '@enum/UserTypes';
import { CustomValidator } from '@commons/custom-validator';
import { PageRouteVariable } from '@commons/page-route-variable';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';

import { AuthenticatedUserResponse, AuthService } from '@services/API/auth.service';
import { GoogleAuthService, SocialUser } from '@services/google-auth.service';

import { ActivatePrePaidAccountPopupComponent } from '@matbia/matbia-shared-popup/activate-pre-paid-account-popup/activate-pre-paid-account-popup.component';
import { SettingAPIService } from '@services/API/setting-api.service';
import { AnalyticsService } from '@services/analytics.service';

import { environment } from './../../../../environments/environment';
import { LandingModuleService } from '../../landing/landing-module.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { CardLoginComponent } from '../card-login/card-login.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [SharedModule, CardLoginComponent, InputErrorComponent, ButtonLoaderComponent],
  providers: [ReCaptchaV3Service, RecaptchaLoaderService],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  active = 1;
  pageTitle = 'Matbia - Login';

  isCardAndPINLogin = false;
  passwordType = 'password';
  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Matbia - Login',
  };

  private _loginSubscriptions: Subscription = new Subscription();
  private _forgotPassSubscriptions: Subscription = new Subscription();

  signInFormGroup!: UntypedFormGroup;
  signUpWithoutCardForm!: UntypedFormGroup;
  formGroup!: FormGroup;
  public pinConfig = {
    length: 4,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'form-control otp-input-password',
    containerClass: 'pinnumber-box',
  };

  public returnUrl = '/';
  public dashboardUrl = '';
  public version: string = environment.version;

  isSetPassword = false;
  isLoading = false;
  isSubmitted = false;

  txtForgotEmail = '';

  tmpName = 'signin';

  @ViewChild('contentModal') contentModal: any;

  @ViewChild('googleSSOBtn') googleSSOBtn!: ElementRef;
  firstName: string = '';

  @ViewChild('signInInput', { static: false })
  set signInInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      element.nativeElement.focus();
    }
  }

  @ViewChild('signUpWithEmailInput', { static: false })
  set signUpWithEmailInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      element.nativeElement.focus();
    }
  }

  @ViewChild('forgotEmailInput', { static: false })
  set forgotEmailInput(element: ElementRef<HTMLInputElement>) {
    if (element) {
      element.nativeElement.focus();
    }
  }

  get Username() {
    return this.signInFormGroup.get('userName');
  }

  get Password() {
    return this.signInFormGroup.get('password');
  }

  get EmailWithCard() {
    return this.signUpWithoutCardForm.get('email');
  }

  get cardNumber() {
    return this.formGroup.get('cardNumber');
  }

  socialUser$!: Observable<SocialUser | null>;

  isSticky = false;

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    this.isSticky = window.pageYOffset >= 100;
  }

  constructor(
    private metaTags: Meta,
    protected title: Title,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private notificationService: NotificationService,
    private recaptchaV3Service: ReCaptchaV3Service,
    public authService: AuthService,
    private localStorageDataService: LocalStorageDataService,
    private landingModuleService: LandingModuleService,
    private socialAuth: GoogleAuthService,
    private settingAPI: SettingAPIService,
    private analytics: AnalyticsService,
    private commonService: CommonDataService,
    private matbiaCardAPI: MatbiaCardAPIService
  ) {}

  ngOnInit() {
    if (this.commonService.isUpdateInfoPopupOpen()) {
      this.commonService.updateInfoPopupRef()?.dismiss();
      this.commonService.isUpdateInfoPopupOpen.set(false);
    }

    this.formGroup = this.fb.group({
      cardNumber: new FormControl(
        '',
        Validators.compose([Validators.required, CustomValidator.cardValidator(this.commonService)])
      ),
    });
    const state = history.state;
    if (state && state.tmpName == 'showForgotPassword') {
      this.tmpName = state.tmpName;
    }
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
    const activeTab = history.state?.activeTab;
    this.active = activeTab === 'organization' ? 2 : 1;
    if (this.route.url.includes('orglogin')) {
      this.active = 2;
    }
    this.dashboardUrl = this.landingModuleService.DashboardUrlString;
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login_footer');

    this.activeRoute.queryParamMap.subscribe((params) => {
      const hasReturnValue = params.get('returnUrl');
      const hasShulKiosk = params.get(Params.SHUL_KIOSK);

      const userHandle = params.get(Params.USER_HANDLE);

      if (userHandle) {
        this.checkReportAccess(userHandle);
        this.dashboardUrl = `/dashboard/enter-donor-portal?${Params.USER_HANDLE}=${userHandle}`;
        return;
      }

      if (hasReturnValue) {
        this.returnUrl = hasReturnValue;
      }

      if (hasShulKiosk) {
        this.dashboardUrl = this.landingModuleService.DashboardWithShulKioskString;
      }

      if (params.has(Params.BLOCK_BANK_MANAGEMENT)) {
        const hasBlockManagement = params.get(Params.BLOCK_BANK_MANAGEMENT);
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${Params.BLOCK_BANK_MANAGEMENT}=${hasBlockManagement}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${Params.BLOCK_BANK_MANAGEMENT}=${hasBlockManagement}`;
        }
      }

      if (params.has(Params.BLOCK_PLAID)) {
        const hasBlockPlaid = params.get(Params.BLOCK_PLAID);
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${Params.BLOCK_PLAID}=${hasBlockPlaid}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${Params.BLOCK_PLAID}=${hasBlockPlaid}`;
        }
      }

      if (
        (params.has(Params.UTM_CAMPAIGN) ||
          params.has(Params.UTM_MEDIUM) ||
          params.has(Params.UTM_SOURCE) ||
          params.has(Params.UTM_ID)) &&
        environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER
      ) {
        const utm_c = params.get(Params.UTM_CAMPAIGN);
        const utm_m = params.get(Params.UTM_MEDIUM);
        const utm_s = params.get(Params.UTM_SOURCE);
        const utm_id = params.get(Params.UTM_ID);
        const utnQuery = `${Params.UTM_CAMPAIGN}=${utm_c}&${Params.UTM_MEDIUM}=${utm_m}&${Params.UTM_SOURCE}=${utm_s}&${Params.UTM_ID}=${utm_id}`;
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${utnQuery}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${utnQuery}`;
        }
      }

      if (params.has(Params.CARD_ID)) {
        this.isCardAndPINLogin = true;
      }
    });

    this.signInFormGroup = this.fb.group({
      userName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });

    this.signUpWithoutCardForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidator.email()])],
      card: ['', Validators.required],
      pin: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
    });

    this.activeRoute.paramMap
      .pipe(map(() => window.history.state))
      .subscribe((data: { isSetPassword: boolean; navigationId: number }) => {
        if (data && data.isSetPassword) {
          this.isSetPassword = data.isSetPassword;
        }
      });

    this.socialUser$ = this.socialAuth.socialUser$;

    this.socialUser$.subscribe((res) => {
      if (res) {
        this.isLoading = true;
        this.authService
          .saveGoogleLogin({
            email: res.email,
            token: res.jti,
          })
          .pipe(
            map((data) => data),
            switchMap(() => {
              return this.authService.googleLogin({
                email: res.email,
                token: res.jti,
              });
            })
          )
          .subscribe(
            (response) => {
              this.isLoading = false;
              if (response) {
                this.analytics.initLoginEvent('Google');
                this.checkUserInFlow(response);
              }
            },
            (err) => {
              this.isLoading = false;
              this.notificationService.showError(err.error, 'Error !');
            }
          );
      }
    });
  }

  ngAfterViewInit(): void {
    this.socialAuth.load().then(() => {
      this.socialAuth.renderGoogleButton('donorGoogleButton');
    });
  }

  ngOnDestroy() {
    this._loginSubscriptions.unsubscribe();
    this._forgotPassSubscriptions.unsubscribe();
    this.notificationService.clearAllToaster();
  }

  login() {
    this.isSubmitted = true;
    if (this.signInFormGroup.invalid) {
      this.signInFormGroup.markAllAsTouched();
      return;
    }

    this._loginSubscriptions = this.recaptchaV3Service.execute('login').subscribe(
      (token) => this.loginAction(token),
      () => {
        this.isLoading = false;
        this.notificationService.showError('Sorry', 'Error !');
      }
    );
  }

  ShowPassword(val: boolean) {
    if (val) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
  }

  loginAction(token: string) {
    this.isLoading = true;
    this.authService.login({ ...this.signInFormGroup.value, recapcha: token }).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res) {
          this.analytics.initLoginEvent('Auth');
          this.checkUserInFlow(res);
          this.localStorageDataService.setDisplayInfo(res?.isDisplayinfoComplete);
        }
      },
      (error) => {
        this.isLoading = false;
        this.notificationService.showError(error.error, 'Error !');
      }
    );
  }

  backToSignIn(event: Event) {
    event.preventDefault();
    this.notificationService.clearAllToaster();
    this.tmpName = 'signin';
    this.changeDetectorRef.detectChanges();
  }

  showForgotPassword() {
    this.tmpName = 'showForgotPassword';
    this.clearNotification();
    this.changeDetectorRef.detectChanges();
  }

  showCreateOnlineAccount() {
    this.tmpName = 'signupWithoutEmail';
    this.clearNotification();
    this.changeDetectorRef.detectChanges();
  }

  goToSignUpPage() {
    if (this.active === 1) {
      this.route.navigate([`/${PageRouteVariable.AppSignupUrl}`], {
        queryParams: {},
        queryParamsHandling: 'merge',
      });

      return;
    }

    if (this.active === 2) {
      this.route.navigate([`/${PageRouteVariable.AppSignupUrl}`], {
        queryParams: {
          active: 2,
        },
        queryParamsHandling: 'merge',
      });
      return;
    }
  }

  activeIdChange() {
    this.socialAuth.renderGoogleButton(this.active === 1 ? 'donorGoogleButton' : 'orgGoogleButton');
    this.changeDetectorRef.detectChanges();
  }

  sendResetLink() {
    if (this.txtForgotEmail) {
      this._forgotPassSubscriptions = this.recaptchaV3Service.execute('ForgotPassword').subscribe(
        (token) => this.sendResetLinkAction(token),
        () => {
          this.isLoading = false;
          this.notificationService.showError('Sorry', 'Error !');
        }
      );
    } else {
      this.notificationService.showError('Please Enter valid email', 'Error !');
    }
  }

  sendResetLinkAction(token: string) {
    this.isLoading = true;
    this.authService.forgotPassword(this.txtForgotEmail, token).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.txtForgotEmail = '';
        if (res) {
          this.tmpName = 'sendResetLink';
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.isLoading = false;
        this.notificationService.showError(error.error, 'Error !');
      }
    );
  }

  openEmail() {
    window.location.href = 'https://mail.google.com/mail/u/0/#inbox';
  }

  tryAnotherMail(event: Event) {
    event.preventDefault();
    this.tmpName = 'showForgotpassword';
    this.txtForgotEmail = '';
    this.changeDetectorRef.detectChanges();
  }

  checkUserInFlow(res: AuthenticatedUserResponse) {
    this.localStorageDataService.setLoginUserDataAndToken(res);
    this.firstName = this.localStorageDataService.getUserFirstName();
    const userType = this.localStorageDataService.getLoginUserType();
    this.settingAPI.getAllEntitySettings().subscribe((res) => {
      res.settings.forEach((entity) => {
        if (entity.settingName === 'GenerateTokens') {
          const val = entity.settingValue.toLowerCase();
          this.localStorageDataService.setGenerateTokenInfo(val === 'true');
        }
      });
    });
    if ((res.isCardSettingsSaved == null || res.isCardSettingsSaved == false) && userType == UserTypes.DONOR) {
      this.route.navigate([`/${PageRouteVariable.SendMeCardUrl}`], { state: { isCardSettingsSaved: false } });
      return;
    }
    const queryParams = {
      userHandle: res.userName,
    };

    // Remove the body class when login is successful
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('login_footer');

    if (this.localStorageDataService.isDonor()) {
      if (!res.isBankAccountLinked) {
        this.landingModuleService.goToCardSettingPage({ ...queryParams, activeStep: 2 });
        return;
      }
    }

    if (this.localStorageDataService.isOrganization() || this.localStorageDataService.isBusiness()) {
      this.settingAPI.getEntitySetting('UseBatchAsRedeem').subscribe((settingRes) => {
        if (settingRes) {
          this.localStorageDataService.setEntitySetting(settingRes);
        }

        if (!res.isBankAccountLinked) {
          this.landingModuleService.goToOrgSettingPage({ ...queryParams });
          return;
        }

        if (this.returnUrl !== '/') {
          this.route.navigateByUrl(this.returnUrl, { onSameUrlNavigation: 'reload' });
        } else {
          this.route.navigateByUrl(this.dashboardUrl, { onSameUrlNavigation: 'reload' });
        }
      });

      return;
    }

    if (this.returnUrl !== '/') {
      this.route.navigateByUrl(this.returnUrl, { onSameUrlNavigation: 'reload' });
    } else {
      this.route.navigateByUrl(this.dashboardUrl, { onSameUrlNavigation: 'reload' });
    }
  }

  onOtpChange(data: any) {
    this.signUpWithoutCardForm.patchValue({
      pin: data,
    });

    this.signUpWithoutCardForm.updateValueAndValidity();
  }

  onSignUpWithoutCardFormSubmit() {
    if (this.signUpWithoutCardForm.invalid) {
      this.signUpWithoutCardForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const value = this.signUpWithoutCardForm.value;

    this.authService
      .matbiaCardLogin({
        matbiaCardNum: value.card,
        pin: value.pin,
      })
      .pipe(
        map((data) => data),
        switchMap((data) => {
          this.localStorageDataService.setLoginUserDataAndToken(data);

          return this.authService.shulKioskSetPassword({
            email: value.email,
            userHandle: data.userName,
          });
        })
      )
      .subscribe(
        (val) => {
          this.isLoading = false;
          if (val) {
            this.openCardPopup();
          }
        },
        (err) => {
          this.isLoading = false;

          this.notificationService.showError(err.error, 'Error !');
        }
      );
  }

  openCardPopup() {
    const modalRef = this.modalService.open(this.contentModal, {
      centered: true,
      keyboard: false,
      windowClass: 'active-card-pop',
    });

    modalRef.closed.subscribe(() => {
      this.route.navigate(['/']);
    });
  }

  clearNotification() {
    this.notificationService.clearAllToaster();
  }

  openPrePaidAccount() {
    const modalOptions = {
      centered: true,
      keyboard: false,
      windowClass: 'active-prepaid-account-pop',
    };
    this.modalService.open(ActivatePrePaidAccountPopupComponent, modalOptions);
  }

  private checkReportAccess(_userHandle: string) {
    if (this.localStorageDataService.isReport()) {
      this.route.navigate(['/dashboard/enter-donor-portal'], {
        queryParamsHandling: 'preserve',
      });
    }

    const reportData = this.localStorageDataService.getReportData();

    if (reportData && reportData.userType && reportData.userType === UserTypes.REPORT) {
      this.route.navigate(['/dashboard/enter-donor-portal'], {
        queryParamsHandling: 'preserve',
      });
    }
  }

  ValidateCard() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const userhandle = this.localStorageDataService.getLoginUserUserName();
    const queryParams = {
      userHandle: userhandle,
    };
    const cardNumber = this.cardNumber?.value?.replace(/[-\s]/g, '');
    const emailValue = this.localStorageDataService.getUserCardOrEmailValue()?.cardOrEmailValue;
    this.matbiaCardAPI.validateCard(cardNumber, emailValue, '').subscribe((res: ValidateCardResponse) => {
      if (res) {
        this.landingModuleService.goToCardSettingPage({ ...queryParams, activeStep: 0 }, { isActivateCard: true });
      }
    });
  }
}
