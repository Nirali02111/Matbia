import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { AuthenticatedUserResponse, AuthService } from '@services/API/auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';

import { SharedModule } from '@matbia/shared/shared.module';
import { ForgotPasswordPageComponent } from '../forgot-password-page/forgot-password-page.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-enter-password-page',
  templateUrl: './enter-password-page.component.html',
  styleUrl: './enter-password-page.component.css',
  imports: [SharedModule, ForgotPasswordPageComponent, InputErrorComponent],
})
export class EnterPasswordPageComponent {
  passwordType = 'password';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private localStorageDataService: LocalStorageDataService,
    private recaptchaV3Service: ReCaptchaV3Service,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}
  formGroup!: FormGroup;
  cardOrEmailValue: string = '';
  txtForgotEmail = '';
  tmpName: string = 'enterpassword';

  private _loginSubscriptions: Subscription = new Subscription();

  get Password() {
    return this.formGroup.get('password');
  }

  ngOnInit() {
    this.cardOrEmailValue = this.localStorageDataService.getUserCardOrEmailValue().cardOrEmailValue;
    this.formGroup = this.fb.group({
      password: new FormControl('', Validators.compose([Validators.required])),
    });
  }
  login() {
    if (this.formGroup.invalid) {
      return;
    }
    this._loginSubscriptions = this.recaptchaV3Service.execute('login').subscribe(
      (token) => this.loginAction(token),
      () => {
        this.notificationService.showError('Sorry', 'Error !');
      }
    );
  }

  loginAction(token: string) {
    let formData: any = {
      password: this.Password?.value,
      recapcha: token,
    };
    if (this.localStorageDataService.getUserCardOrEmailValue().isEmail) {
      formData.userName = this.cardOrEmailValue;
    } else {
      formData.cardNum = this.cardOrEmailValue;
    }
    this.authService.login(formData).subscribe(
      (res: any) => {
        if (res) {
          this.checkUserInFlow(res);
        }
      },
      (error) => {
        this.Password?.setErrors({ serverError: error.error });
      }
    );
  }

  checkUserInFlow(res: AuthenticatedUserResponse) {
    this.localStorageDataService.setLoginUserDataAndToken(res);
    this.router.navigate(['/dashboard']);
  }

  ShowPassword(val: boolean) {
    if (val) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
  }

  redirectToCardEmailLoginPage() {
    this.router.navigate(['/']);
  }
  showForgotPassword() {
    this.router.navigate(['/auth'], { state: { tmpName: 'showForgotPassword' } });
  }

  ngOnDestroy() {
    this._loginSubscriptions.unsubscribe();
  }
}
