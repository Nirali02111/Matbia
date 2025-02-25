import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss'],
  imports: [SharedModule],
})
export class BottomBarComponent implements OnInit {
  isBatchVisible = false;
  isDevEnv = false;

  constructor(
    private router: Router,
    private pageRoute: PageRouteVariable,
    private matbiaObserver: MatbiaObserverService
  ) {}

  ngOnInit(): void {
    this.matbiaObserver.batchVisible$.subscribe((val) => {
      this.isBatchVisible = val;
    });

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
  }

  getTransactionsRouterLink() {
    return this.pageRoute.getTransactionsRouterLink();
  }

  getSchedulesRouterLink() {
    return this.pageRoute.getSchedulesRouterLink();
  }

  getRequestsRouterLink() {
    return this.pageRoute.getRequestsRouterLink();
  }

  getDashboardRouterLink() {
    return this.pageRoute.getDashboardRouterLink();
  }

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  getTokenListRouterLink() {
    return this.pageRoute.getTokenListRouterLink();
  }

  goToAddFundsRouterLink(event: any) {
    event.preventDefault();
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    this.router.navigate(this.pageRoute.getAddFundsRouterLink());
  }

  getProcessCardRouterLink() {
    return this.pageRoute.getProcessCardRouterLink();
  }

  getProcessTokenListRouterLink() {
    return this.pageRoute.getProcessTokenListRouterLink();
  }

  getWithdrawFundsRouterLink() {
    return this.pageRoute.getWithdrawFundsRouterLink();
  }

  getBatchClosingOptionsRouterLink() {
    return this.pageRoute.getBatchClosingOptionsRouterLink();
  }
}
