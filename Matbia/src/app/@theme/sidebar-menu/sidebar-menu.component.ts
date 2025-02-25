import { CommonDataService } from '@commons/common-data-service.service';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PageRouteVariable } from '@commons/page-route-variable';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import packageInfo from '../../../../package.json';
import { MatbiaObserverService } from '@commons/matbia-observer.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { AccountHashComponent } from '@matbia/matbia-directive/components/account-hash/account-hash.component';
import { PersonalAccessControlDirective } from '@matbia/matbia-directive/access-control/personal-access-control.directive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  imports: [SharedModule, AccountHashComponent, PersonalAccessControlDirective],
})
export class SidebarMenuComponent implements OnInit, OnDestroy {
  @ViewChild('sidebarRef') sidebar!: ElementRef;

  isOpen = true;
  isOpenMobile = false;
  isBatchVisible = false;
  isDevEnv = false;
  isProdEnv = false;
  isDonor = false;
  public version = packageInfo.version;
  public currentYear: number = new Date().getFullYear();
  isEntityId: boolean = true;
  showSidebarToken: boolean = false;
  showMenus: any = {
    addFundsMenu: false,
    activityMenu: false,
    cardsMenu: false,
    tokenMenu: false,
    bankAccountsMenu: false,
    profileMenu: false,
  };
  requestsCount: any;
  isEntitySubscriber!: Subscription;
  batchSubscription!: Subscription;
  devModeSubscription!: Subscription;
  prodModeSubscription!: Subscription;
  toShowGenerateTokenButton: boolean = false;

  constructor(
    private pageRoute: PageRouteVariable,
    private localStorageDataService: LocalStorageDataService,
    private matbiaObserver: MatbiaObserverService,
    public commonDataService: CommonDataService
  ) {}

  ngOnDestroy(): void {
    this.isEntitySubscriber.unsubscribe();
    this.batchSubscription.unsubscribe();
    this.devModeSubscription.unsubscribe();
    this.prodModeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.toShowGenerateTokenButton = this.localStorageDataService.getGenerateTokenInfo();
    this.localStorageDataService.requestCount.subscribe(() => {
      this.requestsCount = this.localStorageDataService.requestsCount;
    });
    this.isDonor = this.localStorageDataService.isDonor() || this.localStorageDataService.isBusinessDonor();
    this.requestsCount = this.localStorageDataService.requestsCount;
    this.currentYear = new Date().getFullYear();
    this.syncWithLocal();
    this.isEntitySubscriber = this.matbiaObserver.isEnitityId$.subscribe((res) => {
      if (res) {
        this.showSidebarToken = true;
      } else {
        this.isEntityId = false;
        this.showSidebarToken = false;
      }
    });
    this.batchSubscription = this.matbiaObserver.batchVisible$.subscribe((val) => {
      this.isBatchVisible = val;
    });

    this.devModeSubscription = this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
    this.prodModeSubscription = this.matbiaObserver.prodMode$.subscribe((val) => {
      this.isProdEnv = val;
    });
    this.syncWithLocalMenu();
  }

  ngAfterViewInit() {
    this.restoreScrollPosition();
  }

  saveScrollPosition(event: any) {
    localStorage.setItem('sidebarScroll', event.target.scrollTop);
  }

  restoreScrollPosition() {
    const scrollPosition = localStorage.getItem('sidebarScroll');
    if (scrollPosition && this.sidebar) {
      this.sidebar.nativeElement.scrollTop = scrollPosition;
    }
  }

  syncWithLocalMenu() {
    const hasValue = localStorage.getItem('sidebarMenu');

    if (!hasValue) {
      return;
    }

    this.showMenus = JSON.parse(hasValue);
  }

  toggleNavbar(menu: string) {
    this.showMenus[menu] = !this.showMenus[menu];
    if (this.showMenus[menu]) {
      Object.keys(this.showMenus).forEach((key) => {
        if (key !== menu) {
          this.showMenus[key] = false;
        }
      });
    }

    localStorage.setItem('sidebarMenu', JSON.stringify(this.showMenus));
  }

  closeAllMenus() {
    this.showMenus = {
      addFundsMenu: false,
      activityMenu: false,
      cardsMenu: false,
      tokenMenu: false,
      bankAccountsMenu: false,
      profileMenu: false,
    };
    localStorage.setItem('sidebarMenu', JSON.stringify(this.showMenus));
  }

  getDashboardRouterLink() {
    return this.pageRoute.getDashboardRouterLink();
  }

  getEnterDonorPortalRouterLink() {
    return [`/${PageRouteVariable.DashboardUrl}/enter-donor-portal`];
  }

  getEnterDonorPortalLogRouterLink() {
    return [`/${PageRouteVariable.DashboardUrl}/logs`];
  }

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  getAutoDepositRouterLink() {
    return this.pageRoute.getAutoDepositRouterLink();
  }

  getInternalTransferRouterLink() {
    return this.pageRoute.getInternalTransferRouterLink();
  }

  getWithdrawFundsRouterLink() {
    return this.pageRoute.getWithdrawFundsRouterLink();
  }

  getProcessCardRouterLink() {
    return this.pageRoute.getProcessCardRouterLink();
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

  getProfileRouterLink() {
    return this.pageRoute.getProfileRouterLink();
  }

  getCardsRouterLink() {
    return this.pageRoute.getCardsRouterLink();
  }

  getAddAdditionalCardRouterLink() {
    return this.pageRoute.getAddAdditionalCardRouterLink();
  }

  getBankAccountsRouterLink() {
    return this.pageRoute.getBankAccountsRouterLink();
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoute.getLinkNewAccountRouterLink();
  }

  getAddAdditionalRouterLink() {
    return this.pageRoute.getAddAdditionalCardRouterLink();
  }

  getCardRequestRouterLink() {
    return this.pageRoute.getCardRequestRouterLink();
  }

  getNotificationRouterLink() {
    return this.pageRoute.getNotificationRouterLink();
  }

  getBatchesRouterLink() {
    return this.pageRoute.getBatchesRouterLink();
  }

  getCurrentBatchesRouterLink() {
    return this.pageRoute.getCurrentBatchesRouterLink();
  }

  getBatchClosingOptionsRouterLink() {
    return this.pageRoute.getBatchClosingOptionsRouterLink();
  }

  getIntegrationRouterLink() {
    return this.pageRoute.getIntegrationsRouterLink();
  }

  getGenerateTokensRouterLink() {
    return this.pageRoute.getGenerateTokensRouterLink();
  }

  getTokenListRouterLink() {
    return this.pageRoute.getTokenListRouterLink();
  }

  getTokenSettingsRouterLink() {
    return this.pageRoute.getTokenSettingsRouterLink();
  }
  getProcessTokenListRouterLink() {
    return this.pageRoute.getProcessTokenListRouterLink();
  }

  getOrderTokenBookRouterLink() {
    return this.pageRoute.getOrderTokenBookRouterLink();
  }

  getAccountsRouterLink() {
    return this.pageRoute.getAccountsRouterLink();
  }

  getStatementReportRouterLink() {
    return this.pageRoute.getStatementReportRouterLink();
  }

  isCardSettingsSaved() {
    const currentUser = this.localStorageDataService.getLoginUserData();
    if (!currentUser) {
      return false;
    }

    if (currentUser.isCardSettingsSaved) {
      return true;
    }

    return false;
  }

  syncWithLocal() {
    const hasValue = localStorage.getItem('sidebar');

    if (!hasValue) {
      this.openPanel();
      return;
    }

    if (hasValue && hasValue === '0') {
      this.closePanel();
    }

    if (hasValue && hasValue === '1') {
      this.openPanel();
    }
  }

  openPanel() {
    const bodyElement = document.body;
    this.isOpen = true;
    bodyElement.classList.remove('slidebar-close');
    bodyElement.classList.add('slidebar-open');
    localStorage.setItem('sidebar', '1');
  }

  closePanel() {
    const bodyElement = document.body;
    this.isOpen = false;
    bodyElement.classList.remove('slidebar-open');
    bodyElement.classList.add('slidebar-close');
    bodyElement.classList.remove('slidebar-open-mobile');
    localStorage.setItem('sidebar', '0');
  }

  changeBodyClass() {
    const bodyElement = document.body;
    if (bodyElement) {
      if (this.isOpen) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }
  }

  changeBodyClassMobile() {
    const bodyElement = document.body;
    if (bodyElement) {
      if (this.isOpenMobile) {
        const bodyElement = document.body;
        this.isOpenMobile = false;
        bodyElement.classList.remove('slidebar-open-mobile');
      } else {
        const bodyElement = document.body;
        this.isOpenMobile = true;
        bodyElement.classList.add('slidebar-open-mobile');
      }
    }
  }
}
