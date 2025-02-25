import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidator } from '@commons/custom-validator';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { AuthService } from '@services/API/auth.service';
import { map } from 'rxjs/operators';

import { SharedModule } from '@matbia/shared/shared.module';
import { EmailMaskPipe } from '@matbia/matbia-pipes/email-mask.pipe';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-create-account-page',
  templateUrl: './create-account-page.component.html',
  styleUrl: './create-account-page.component.css',
  imports: [SharedModule, EmailMaskPipe, InputErrorComponent],
})
export class CreateAccountPageComponent {
  formGroup!: FormGroup;
  isEmail: boolean = false;

  card!: string;
  emailVal: string = '';
  hasOtherEmailValue: string = '';
  emailText: string = 'CONFIRM EMAIL ADDRESS:';
  isRegisterNewEmail: boolean = true;
  tmpName: string = 'withEmailNoPassword';

  public pinConfig = {
    length: 4,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'form-control otp-input-password',
    containerClass: 'pinnumber-box',
  };

  get Email() {
    return this.formGroup.get('email');
  }

  get Pin() {
    return this.formGroup.get('pin');
  }

  constructor(
    private fb: FormBuilder,
    private localStorageDataService: LocalStorageDataService,
    public authService: AuthService,
    private router: Router,
    private pageRoute: PageRouteVariable
  ) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidator.email()])],
      pin: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
    });
    let cardValue = this.localStorageDataService.getUserCardOrEmailValue();
    this.isEmail = this.localStorageDataService.getUserCardOrEmailValue()?.isEmail;
    if (this.localStorageDataService.getUserCardFromEmailValue()?.otherEmail == '') {
      this.isRegisterNewEmail = false;
    }
    this.card = cardValue?.cardValueFromEmail;
    if (history.state) {
      const loginType = history.state.type;
      if (loginType === 'withEmailNoPassword') {
        this.tmpName = 'withEmailNoPassword';
      } else if (loginType === 'noEmail&NoPassword') {
        this.tmpName = 'noEmail&NoPassword';
      } else {
        this.tmpName = 'withEmailNoPassword';
      }
    }
    if (!this.card) {
      this.card = cardValue?.cardOrEmailValue;
    }
    this.emailVal = cardValue?.cardOrEmailValue;
    const cardEmailVal = this.localStorageDataService.getUserCardFromEmailValue();
    this.hasOtherEmailValue = cardEmailVal?.otherEmail;
  }

  onOtpChange(data: any) {
    this.formGroup.patchValue({
      pin: data,
    });
    this.Pin?.markAsTouched();
    this.formGroup.updateValueAndValidity();
  }

  setUpPassword() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const value = this.formGroup.value;
    let cardValue: any = this.localStorageDataService.getUserCardOrEmailValue().cardOrEmailValue;
    cardValue = cardValue?.replace(/[-\s]/g, '');
    this.authService
      .matbiaCardLogin({
        matbiaCardNum: this.card,
        pin: value.pin,
      })
      .pipe(
        map((data) => {
          this.localStorageDataService.setLoginUserDataAndToken(data);
          return data;
        })
      )
      .subscribe(
        (val) => {
          if (val) {
            const dynamicState: any = {
              tmpName: 'checkEmailTmp2',
              accountemail: this.Email?.value,
              showValidatecard: true,
            };
            if ((this.tmpName = 'noEmail&NoPassword')) {
              dynamicState['type'] = 'noEmail&NoPassword';
            }
            this.router.navigate(['/send-me-email'], {
              state: dynamicState,
            });
          }
        },
        (err) => {
          this.Pin?.setErrors({
            serverError: err.error,
          });
        }
      );
  }

  openSendMeEmail() {
    this.router.navigate(this.pageRoute.getSendMeEmailRouterLink());
  }

  registerWithNewEmail() {
    this.isRegisterNewEmail = false;
    this.emailText = 'ENTER NEW EMAIL ADDRESS';
    this.formGroup.get('email')?.setValue(null);
  }

  goBackToCardLoginPage() {
    this.router.navigate(this.pageRoute.getCardLoginRouterLink());
  }
}
