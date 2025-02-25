import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { CommonDataService } from '@commons/common-data-service.service';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-card-email-login-scenarios',
  templateUrl: './card-email-login-scenarios.component.html',
  styleUrl: './card-email-login-scenarios.component.css',
  imports: [SharedModule],
})
export class CardEmailLoginScenariosComponent {
  isEmail: boolean = false;
  cardOrEmailValue: string = '';
  cardCase1: string = '';
  cardCase2: string = '';
  cardCase3: string = '';
  cardCase4: string = '';
  cardCase5: string = '';
  cardThroughEmail: any = false;
  otherEmail: string = '';

  constructor(
    private pageRoute: PageRouteVariable,
    private router: Router,
    private localStorageDataService: LocalStorageDataService,
    private renderer: Renderer2,
    public commonSevice: CommonDataService
  ) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      const display = this.router.getCurrentNavigation()?.extras?.state?.['display'];
      if (display === 'scenarios') {
      }
    }
  }

  ngOnInit() {
    this.isEmail = this.localStorageDataService.getUserCardOrEmailValue().isEmail;
    const val = this.localStorageDataService.getCardFromEmail();
    this.cardThroughEmail = val;

    this.renderer.addClass(document.body, 'overflow-hidden');
  }

  click(hasEmail: boolean, hasPassword: boolean) {
    if (hasEmail && hasPassword) {
      return this.router.navigate(this.pageRoute.getEnterPasswordRouterLink());
    }
    if (hasEmail && !hasPassword) {
      return this.router.navigate(this.pageRoute.getSendMeEmailRouterLink());
    }
    if (!hasEmail && !hasPassword) {
      return this.router.navigate(this.pageRoute.getCardLoginRouterLink());
    }
    return;
  }

  card(
    otherEmail: string = '',
    hasEmail: boolean | null = null,
    hasPassword: boolean | null = null,
    cardIsActive: boolean | null = null,
    cardIsPrepaid: boolean | null = null,
    cardIsInactive: boolean | null = null
  ) {
    // Handle specific cases based on input
    if (otherEmail == '' && hasEmail && hasPassword) {
      this.cardCase1 = 'Card is active with email and password';
      this.router.navigate(this.pageRoute.getEnterPasswordRouterLink());
    } else if (otherEmail == '' && hasEmail && !hasPassword) {
      this.cardCase2 = 'Card is active with email. No password';
      this.router.navigate(this.pageRoute.getCreateAccountPageRouterLink());
    } else if (cardIsPrepaid && !cardIsActive && !hasEmail && !hasPassword) {
      this.cardCase4 = 'Card is active Prepaid. No email and password.';
      this.router.navigate(this.pageRoute.getRegularSignUpRouterLink(), { state: { text: 'prepaidCreateAccount' } });
    } else if (cardIsInactive) {
      this.cardCase5 = 'Card is not activated';
      this.router.navigate(this.pageRoute.getRegularSignUpRouterLink());
    } else if (otherEmail && hasEmail && hasPassword) {
      this.router.navigate(this.pageRoute.getAccountFoundRouterLink());
    } else if (otherEmail && hasEmail && !hasPassword) {
      this.cardCase2 = 'Card has active email .No password';
      this.router.navigate(this.pageRoute.getCreateAccountPageRouterLink(), { state: { type: 'withEmailNoPassword' } });
    } else if (cardIsActive && !hasEmail && !hasPassword) {
      this.router.navigate(this.pageRoute.getCreateAccountPageRouterLink(), { state: { type: 'noEmail&NoPassword' } });

      this.cardCase3 = 'Card is active. No email and password';
    }
  }

  ngOnDestroy(): void {
    this.localStorageDataService.setCardFromEmail(false);

    this.renderer.removeClass(document.body, 'overflow-hidden');
  }
}
