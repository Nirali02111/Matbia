import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-choose-deposite-method',
  templateUrl: './choose-deposite-method.component.html',
  styleUrl: './choose-deposite-method.component.scss',
  imports: [SharedModule],
})
export class ChooseDepositeMethodComponent {
  haveConnectedAccounts = signal<boolean>(false);
  isProdEnv = false;
  constructor(
    private pageRoute: PageRouteVariable,
    public matbiaObserver: MatbiaObserverService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.matbiaObserver.prodMode$.subscribe((val) => {
      this.isProdEnv = val;
    });
    this.activeRoute.data.subscribe((data) => {
      if (data.accounts && data.accounts.data && data.accounts.data.length !== 0) {
        this.haveConnectedAccounts.set(true);
      } else {
        this.haveConnectedAccounts.set(false);
      }
    });
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoute.getLinkNewAccountRouterLink();
  }

  getAddFundsRouterLinkRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  getPaypalCreditCardFundsRouterLink() {
    return this.pageRoute.getPaypalCreditCardFundsRouterLink();
  }

  getWireTransferFundsRouterLink() {
    return this.pageRoute.getWireTransferFundsRouterLink();
  }

  getCheckFundsRouterLink() {
    return this.pageRoute.getCheckFundsRouterLink();
  }

  getDAFundsRouterLink() {
    return this.pageRoute.getDAFundsRouterLink();
  }
}
