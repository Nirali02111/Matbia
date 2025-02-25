import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonDataService } from '@commons/common-data-service.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { AuthService, validateLoginPayload } from '@services/API/auth.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { CardEmailLoginScenariosComponent } from '../card-email-login-scenarios/card-email-login-scenarios.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.css',
  imports: [SharedModule, CardEmailLoginScenariosComponent, InputErrorComponent],
})
export class WelcomePageComponent {
  formGroup!: FormGroup;
  validatePayload: validateLoginPayload = {
    cardNum: null,
    email: null,
  };
  get cardOrEmail() {
    return this.formGroup.get('cardOrEmail');
  }
  isEmailLogin: boolean = false;
  tmpName: string = 'welcomepage';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonService: CommonDataService,
    private router: Router,
    private localStorageDataService: LocalStorageDataService,
    private pageRoute: PageRouteVariable
  ) {}
  ngOnInit() {
    this.localStorageDataService.removeUserCardOrEmailValue();
    this.formGroup = this.fb.group({
      cardOrEmail: new FormControl('', Validators.compose([Validators.required, this.cardOrEmailValidator()])),
    });

    this.commonService.cardThroughEmail = false;
  }
  doValidateLogin() {
    let obj = {
      isEmail: this.isEmailLogin,
      cardOrEmailValue: this.cardOrEmail?.value?.replace(/[-\s]/g, ''),
    };

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.authService.validateLogin(this.validatePayload).subscribe((res) => {
      this.localStorageDataService.setUserCardOrEmailValue(obj);
      if (!this.isEmailLogin) {
        this.localStorageDataService.setUserCardFromEmailValue(res);
      }
      if (!res) return;
      this.formGroup.reset();
      if (this.isEmailLogin) {
        if (res.hasEmail && res.hasPassword) {
          this.router.navigate(this.pageRoute.getEnterPasswordRouterLink());
        }
        if (res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getSendMeEmailRouterLink());
        }
        if (!res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getCardLoginRouterLink());
        }
      } else {
        if (res.hasEmail && res.hasPassword) {
          this.router.navigate(this.pageRoute.getEnterPasswordRouterLink());
        } else if (res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getCreateAccountPageRouterLink());
        } else if (res.cardIsPrepaid && !res.cardIsActive && !res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getRegularSignUpRouterLink(), {
            state: { text: 'prepaidCreateAccount' },
          });
        } else if (res.cardIsPrepaid && res.cardIsActive && !res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getRegularSignUpRouterLink(), {
            state: { text: 'prepaidCreateAccount' },
          });
        } else if (res.cardIsInactive) {
          this.router.navigate(this.pageRoute.getRegularSignUpRouterLink());
        } else if (res.otherEmail && res.hasEmail && res.hasPassword) {
          this.router.navigate(this.pageRoute.getAccountFoundRouterLink());
        } else if (res.otherEmail && res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getCreateAccountPageRouterLink(), {
            state: { type: 'withEmailNoPassword' },
          });
        } else if (res.cardIsActive && !res.hasEmail && !res.hasPassword) {
          this.router.navigate(this.pageRoute.getCreateAccountPageRouterLink(), {
            state: { type: 'noEmail&NoPassword' },
          });
        } else {
          this.router.navigate(this.pageRoute.getRegularSignUpRouterLink());
        }
      }
    });
  }
  cardOrEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.replace(/[-\s]/g, '');

      // Email pattern check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailPattern.test(value)) {
        this.validatePayload.email = value;
        this.isEmailLogin = true;
        this.localStorageDataService.setCardFromEmail(true);

        return null; // Valid email
      } else if (this.commonService.luhnCheck(value)) {
        this.validatePayload.cardNum = value;
        this.isEmailLogin = false;
        this.localStorageDataService.setCardFromEmail(false);

        return null; // Valid card number
      } else {
        return { invalidEmailAndCard: true };
      }
    };
  }

  goToSignUpPage() {
    this.router.navigate([`/${PageRouteVariable.AppSignupUrl}`], {
      queryParams: {},
      queryParamsHandling: 'merge',
    });

    return;
  }
}
