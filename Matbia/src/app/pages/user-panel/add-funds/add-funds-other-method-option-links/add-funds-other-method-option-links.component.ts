import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, OnInit, TemplateRef, ViewEncapsulation, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbTooltipConfig, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

type DepositType = 'BANK' | 'CHECK' | 'WIRE' | 'PAYPAL' | 'DAF';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-add-funds-other-method-option-links',
  imports: [AsyncPipe, NgbTooltipModule, NgTemplateOutlet, SharedModule],
  templateUrl: './add-funds-other-method-option-links.component.html',
  styleUrl: './add-funds-other-method-option-links.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddFundsOtherMethodOptionLinksComponent implements OnInit {
  @Input({ required: true }) type: DepositType = 'BANK';

  @ContentChild('timeTemp', { read: TemplateRef })
  timeTemp!: TemplateRef<any>;

  @ContentChild('completedTemp', { read: TemplateRef })
  completedTemp!: TemplateRef<any>;

  @ContentChild('minimumTemplate', { read: TemplateRef })
  minimumTemplate!: TemplateRef<any>;

  @ContentChild('chargesTemplate', { read: TemplateRef })
  chargesTemplate!: TemplateRef<any>;

  @ContentChild('autoDepositTemplate', { read: TemplateRef })
  autoDepositTemplate!: TemplateRef<any>;

  isProdEnv = false;
  haveConnectedAccounts = signal<boolean>(false);

  constructor(
    private activeRoute: ActivatedRoute,
    private pageRoute: PageRouteVariable,
    config: NgbTooltipConfig,
    public matbiaObserver: MatbiaObserverService
  ) {
    config.placement = 'right-top';
  }

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

  getAddFundsRouterLinkRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoute.getLinkNewAccountRouterLink();
  }

  getCheckFundsRouterLink() {
    return this.pageRoute.getCheckFundsRouterLink();
  }

  getWireTransferFundsRouterLink() {
    return this.pageRoute.getWireTransferFundsRouterLink();
  }

  getDAFundsRouterLink() {
    return this.pageRoute.getDAFundsRouterLink();
  }

  getPaypalCreditCardFundsRouterLink() {
    return this.pageRoute.getPaypalCreditCardFundsRouterLink();
  }
}
