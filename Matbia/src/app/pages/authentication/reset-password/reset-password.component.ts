import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@commons/notification.service';
import { AuthenticatedUserResponse, AuthService } from '@services/API/auth.service';

import { CommonDataService } from '@commons/common-data-service.service';
import { CustomValidator } from '@commons/custom-validator';
import { Params } from '@enum/Params';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';

const TOKEN_ID = 'token';

const MisMatch = (otherInputControl: AbstractControl | null): ValidatorFn => {
  return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
    if (
      inputControl.value !== undefined &&
      inputControl.value.trim() !== '' &&
      inputControl.value !== otherInputControl?.value
    ) {
      return { mismatch: true };
    }

    return null;
  };
};

import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [SharedModule, InputErrorComponent],
  providers: [ReCaptchaV3Service],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  passwordType = 'password';
  confirmPasswordType = 'password';
  isLoading = false;
  isAnimate = false;
  isForgotPassword = false;
  isOrgUser = false;
  isSubmitted = false;

  passwordFieldFocusOut = false;
  confirmPasswordFieldFocusOut = false;

  resetPasswordForm!: UntypedFormGroup;

  private _resetSubscriptions: Subscription = new Subscription();

  get EntityId() {
    return this.resetPasswordForm.get('entityId');
  }

  get NewPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get ConfirmNewPassword() {
    return this.resetPasswordForm.get('confirmNewPassword');
  }

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private commonDataService: CommonDataService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private localStorageDataService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      entityId: this.fb.control('', Validators.compose([Validators.required])),
      newPassword: this.fb.control('', Validators.compose([Validators.required, CustomValidator.strongPassword()])),
      confirmNewPassword: this.fb.control('', Validators.compose([Validators.required])),
    });

    this.ConfirmNewPassword?.setValidators(
      Validators.compose([Validators.required, CustomValidator.strongPassword(), MisMatch(this.NewPassword)])
    );
    this.ConfirmNewPassword?.updateValueAndValidity();

    this.NewPassword?.valueChanges.subscribe((val) => {
      if (val) {
        const conf = this.ConfirmNewPassword?.value;
        if (conf !== undefined && conf.trim() !== '' && conf !== val) {
          this.ConfirmNewPassword?.setErrors({ mismatch: true });
        }
        this.ConfirmNewPassword?.updateValueAndValidity();
      }
    });

    this.activeRoute.queryParamMap.subscribe((params) => {
      const id = params.get(Params.IS_FORGOT_PASSWORD);
      if (id) {
        this.isForgotPassword = true;
      }

      const IsOrgUser = params.get('IsOrgUser');
      const isOrgUser = params.get('isOrgUser');
      if (IsOrgUser || isOrgUser) {
        if (IsOrgUser) {
          this.isOrgUser = this.commonDataService.isStringTrue(IsOrgUser);
        }

        if (isOrgUser) {
          this.isOrgUser = this.commonDataService.isStringTrue(isOrgUser);
        }
      }
    });

    this.activeRoute.paramMap.subscribe((params) => {
      const id = params.get(TOKEN_ID);
      if (id) {
        this.resetPasswordForm.patchValue({
          entityId: id,
        });

        this.EntityId?.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy(): void {
    this._resetSubscriptions.unsubscribe();
    this.notificationService.clearAllToaster();
  }

  focused() {
    this.NewPassword?.markAsTouched();
  }

  confirmedFocused() {
    this.ConfirmNewPassword?.markAsTouched();
  }

  resetPassword() {
    this.isSubmitted = true;
    if (this.resetPasswordForm.invalid) {
      this.isAnimate = true;
      setTimeout(() => {
        this.isAnimate = false;
      }, 1500);

      return;
    }

    this._resetSubscriptions = this.recaptchaV3Service.execute('ResetPassword').subscribe(
      (token) => this.resetPasswordAction(token),
      () => {
        this.isLoading = false;
        this.notificationService.showError('Sorry', 'Error !');
      }
    );
  }

  private getAPIPayload(reCaptcha: string) {
    if (this.isOrgUser) {
      return {
        ...this.resetPasswordForm.value,
        currentPassword: null,
        reCaptcha,
        isOrgUser: true,
      };
    }

    return {
      ...this.resetPasswordForm.value,
      currentPassword: null,
      reCaptcha,
      isOrgUser: false,
    };
  }

  resetPasswordAction(reCaptcha: string) {
    this.isLoading = true;

    const apiPayload = this.getAPIPayload(reCaptcha);
    this.authService.resetPassword({ ...apiPayload }).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res) {
          const getSendEmailCardValue: any = this.localStorageDataService.getSendEmailCardValue();
          if (getSendEmailCardValue) {
            this.recaptchaV3Service.execute('login').subscribe(
              (token) => this.loginAction(token, getSendEmailCardValue),
              () => {
                this.notificationService.showError('Sorry', 'Error !');
              }
            );
            return;
          }
          if (this.isForgotPassword) {
            this.router.navigate(['/auth/login'], {
              state: {
                isSetPassword: true,
              },
            });
            return;
          }

          this.router.navigate(['/auth/login'], {
            state: {
              isSetPassword: true,
            },
          });
        }
      },
      (error) => {
        this.isLoading = false;

        this.notificationService.showError(error.error, 'Error !');
      }
    );
  }

  loginAction(token: string, getSendEmailCardValue: string) {
    let formData: any = {
      password: this.NewPassword?.value,
      recapcha: token,
      userName: getSendEmailCardValue,
    };
    this.authService.login(formData).subscribe(
      (res: any) => {
        if (res) {
          this.checkUserInFlow(res);
        }
      },
      (error) => {
        this.router.navigate(['/']);
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

  ShowConfirmPassword(val: boolean) {
    if (val) {
      this.confirmPasswordType = 'password';
    } else {
      this.confirmPasswordType = 'text';
    }
  }
}
