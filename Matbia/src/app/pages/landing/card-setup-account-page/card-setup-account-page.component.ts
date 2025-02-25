import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { AuthenticatedUserResponse, AuthService } from '@services/API/auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { LandingModuleService } from '../landing-module.service';
import { SettingAPIService } from '@services/API/setting-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { EmailMaskPipe } from '@matbia/matbia-pipes/email-mask.pipe';

@Component({
  selector: 'app-card-setup-account-page',
  templateUrl: './card-setup-account-page.component.html',
  styleUrl: './card-setup-account-page.component.css',
  imports: [SharedModule, EmailMaskPipe],
})
export class CardSetupAccountPageComponent {
  hasOtherEmailValue: string = '';
  card!: number;
  signInFormGroup!: FormGroup;
  tmpName: string = 'enterpassword';
  isSubmitted = false;
  passwordType = 'password';
  private _loginSubscriptions: Subscription = new Subscription();
  isLoading = false;
  isEmail: any;

  get Username() {
    return this.signInFormGroup.get('userName');
  }

  get Password() {
    return this.signInFormGroup.get('password');
  }

  constructor(
    private localStorageDataService: LocalStorageDataService,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private notificationService: NotificationService,
    private recaptchaV3Service: ReCaptchaV3Service,
    public authService: AuthService,
    private landingModuleService: LandingModuleService,
    private settingAPI: SettingAPIService,
    private route: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.signInFormGroup = this.fb.group({
      userName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
    const cardEmailVal = this.localStorageDataService.getUserCardFromEmailValue();
    this.hasOtherEmailValue = cardEmailVal?.otherEmail;
    this.isEmail = cardEmailVal?.isEmail;
    const cardValue = this.localStorageDataService.getUserCardOrEmailValue();
    this.card = cardValue?.cardValueFromEmail;
    if (!this.card) {
      this.card = cardValue?.cardOrEmailValue;
    }
  }

  goBackToCardLoginPage() {
    if (this.hasOtherEmailValue) {
      this.router.navigate(this.pageRoute.getCardLoginRouterLink());
    } else {
      this.router.navigate(['/']);
    }
  }

  showForgotPassword() {
    this.router.navigate(['/auth'], { state: { tmpName: 'showForgotPassword' } });
  }

  ShowPassword(val: boolean) {
    if (val) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
  }

  login() {
    this.isSubmitted = true;
    if (this.signInFormGroup.invalid) {
      this.signInFormGroup.markAllAsTouched();
      return;
    }

    this._loginSubscriptions = this.recaptchaV3Service.execute('login').subscribe(
      (token: any) => this.loginAction(token),
      () => {
        this.isLoading = false;
        this.notificationService.showError('Sorry', 'Error !');
      }
    );
  }

  loginAction(token: string) {
    this.authService.login({ ...this.signInFormGroup.value, recapcha: token }).subscribe(
      (res: any) => {
        if (res) {
          this.router.navigate(this.pageRoute.getDashboardRouterLink());

          this.checkUserInFlow(res);
        }
      },
      (error) => {
        this.notificationService.showError(error.error, 'Error !');
      }
    );
  }

  checkUserInFlow(res: AuthenticatedUserResponse) {
    this.localStorageDataService.setLoginUserDataAndToken(res);

    const queryParams = {
      userHandle: res.userName,
    };

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

        if (PageRouteVariable.ReturnPageUrl !== '/') {
          this.route.navigateByUrl(PageRouteVariable.ReturnPageUrl, { onSameUrlNavigation: 'reload' });
        } else {
          this.route.navigateByUrl(this.pageRoute.getDashBoardRouterLink().join('/'), {
            onSameUrlNavigation: 'reload',
          });
        }
      });

      return;
    }

    if (PageRouteVariable.ReturnPageUrl !== '/') {
      this.route.navigateByUrl(PageRouteVariable.ReturnPageUrl, { onSameUrlNavigation: 'reload' });
    } else {
      this.route.navigateByUrl(this.pageRoute.getDashBoardRouterLink().join('/'), { onSameUrlNavigation: 'reload' });
    }
  }

  ngOnDestroy() {
    this._loginSubscriptions.unsubscribe();
  }
}
