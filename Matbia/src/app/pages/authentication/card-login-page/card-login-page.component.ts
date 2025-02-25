import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonDataService } from '@commons/common-data-service.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { AuthService } from '@services/API/auth.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { CardEmailLoginScenariosComponent } from '../../landing/card-email-login-scenarios/card-email-login-scenarios.component';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';

@Component({
  selector: 'app-card-login-page',
  templateUrl: './card-login-page.component.html',
  styleUrl: './card-login-page.component.css',
  imports: [SharedModule, CardEmailLoginScenariosComponent, CreditCardInputComponent],
})
export class CardLoginPageComponent {
  tmpName: string = 'cardLogin';
  userCardEmail: any;
  formGroup!: FormGroup;

  get CardNum() {
    return this.formGroup.get('cardNum');
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonService: CommonDataService,
    private router: Router,
    private localStorageDataService: LocalStorageDataService,
    private pageRoute: PageRouteVariable
  ) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      cardNum: new FormControl('', Validators.compose([Validators.required])),
    });

    this.userCardEmail = this.localStorageDataService.getUserCardOrEmailValue();
    this.userCardEmail.cardValueFromEmail = this.CardNum?.value;
  }

  continueToCards() {
    let obj = {
      cardNum: this.CardNum?.value,
      email: '',
    };
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.authService.validateLogin(obj).subscribe((res) => {
      this.userCardEmail = this.localStorageDataService.getUserCardOrEmailValue();
      this.userCardEmail.cardValueFromEmail = this.CardNum?.value;
      this.localStorageDataService.setUserCardOrEmailValue(this.userCardEmail);
      this.commonService.cardThroughEmail = true;
      this.commonService.notCardThroughEmail = false;
      this.localStorageDataService.setCardFromEmail(true);
      this.localStorageDataService.setUserCardFromEmailValue(res);
      if (!res) return;
      this.formGroup.reset();
      if (res.otherEmail == '' && res.hasEmail && res.hasPassword) {
        this.router.navigate(this.pageRoute.getEnterPasswordRouterLink());
      } else if (res.otherEmail == '' && res.hasEmail && !res.hasPassword) {
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
    });
  }

  redirectToCardEmailLoginPage() {
    this.router.navigate(['/']);
  }

  noCard() {
    this.router.navigate(this.pageRoute.getRegularSignUpRouterLink());
  }

  ngOnDestroy() {
    this.localStorageDataService.setCardFromEmail(false);
  }
}
