import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Assets } from '@enum/Assets';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { MatbiaIdleService } from '@commons/matbia-idle.service';
import { ThemeService } from './../theme.service';
import { CSAgentAPIService } from '@services/API/csagent-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { SearchInputComponent } from '@matbia/matbia-input/search-input/search-input.component';
import { AccountHashComponent } from '@matbia/matbia-directive/components/account-hash/account-hash.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [SharedModule, SearchInputComponent, AccountHashComponent],
})
export class HeaderComponent implements OnInit {
  profileIcon = Assets.PROFILE_IMAGE;
  @ViewChild('searchFilterDD') searchFilterDD!: NgbDropdown;
  landingPageUrl: string = '/' + PageRouteVariable.AuthLoginUrl;

  selectedFilter = '';
  isBatchVisible = false;
  isDevEnv = false;
  accountType = '';
  transactionType = '';
  timeType = '';
  amountType = '';
  isReportUser: boolean = false;
  isShulKiosk = false;
  isBlockBankManagement = false;
  showVoucherCls: string = '';
  reportUserFullName: string = '';
  userFullName: string = '';
  constructor(
    private router: Router,
    private pageRoute: PageRouteVariable,
    private themeService: ThemeService,
    private localStorageDataService: LocalStorageDataService,
    private matbiaObserver: MatbiaObserverService,
    private matbiaIdleService: MatbiaIdleService,
    private csAgentAPI: CSAgentAPIService
  ) {}

  ngOnInit(): void {
    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      this.isShulKiosk = val;
    });

    this.matbiaObserver.blockBankManagement$.subscribe((val) => {
      this.isBlockBankManagement = val;
    });

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    this.matbiaObserver.batchVisible$.subscribe((val) => {
      this.isBatchVisible = val;
    });

    if (this.localStorageDataService.getReportData()) {
      const data = this.localStorageDataService.getReportData();
      if (data) {
        this.isReportUser = true;
        this.reportUserFullName = `${data.firstName || ''} ${data.lastName || ''}`;
        this.userFullName = this.localStorageDataService.getLoginUserFullName();
      }
    }
    this.themeService.filterSectionObservable.subscribe((obj) => (this.selectedFilter = obj.section));
    this.themeService.transactionTypeObservable.subscribe((obj) => (this.transactionType = obj.type));
    this.themeService.accountObservable.subscribe((obj) => (this.accountType = obj.type));
    this.themeService.timeTypeObservable.subscribe((obj) => (this.timeType = obj.type));
    this.themeService.amountTypeObservable.subscribe((obj) => (this.amountType = obj.type));

    this.themeService.searchFilterOpen.subscribe((obj) => {
      if (obj.isOpen) {
        this.searchFilterDD.open();
      }
    });
  }

  closePopup() {
    this.csAgentAPI.CSAgentlogout().subscribe((res) => {
      this.localStorageDataService.setLoginUserDataAndToken(res);
      this.matbiaObserver.broadCastMessage(res);
      this.localStorageDataService.clearReportData();
      window.location.reload();
    });
  }

  // First Menu

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  getInternalTransferRouterLink() {
    return this.pageRoute.getInternalTransferRouterLink();
  }

  getWithdrawFundsRouterLink() {
    return this.pageRoute.getWithdrawFundsRouterLink();
  }

  getBatchClosingOptionsRouterLink() {
    return this.pageRoute.getBatchClosingOptionsRouterLink();
  }

  getHome() {
    return '/';
  }

  getDashboardRouterLink() {
    return this.pageRoute.getDashboardRouterLink();
  }

  // SecondMenu

  getProfileRouterLink() {
    return this.pageRoute.getProfileRouterLink();
  }

  getCardsRouterLink() {
    return this.pageRoute.getCardsRouterLink();
  }

  getBankAccountsRouterLink() {
    return this.pageRoute.getBankAccountsRouterLink();
  }

  getNotificationRouterLink() {
    return this.pageRoute.getNotificationRouterLink();
  }

  getHelpAndFeedbackRouterLink() {
    return this.pageRoute.getHelpAndFeedbackRouterLink();
  }

  getAccountsRouterLink() {
    return this.pageRoute.getAccountsRouterLink();
  }

  getOrderTokenBookRouterLink() {
    return this.pageRoute.getOrderTokenBookRouterLink();
  }

  changeFilterSection(value: string) {
    this.themeService.setFilterSection(value);
  }

  changeAccountType(value: string) {
    this.themeService.setAccountType(value);
  }

  changeTransactionType(value: string) {
    this.themeService.setTransactionType(value);
  }

  changeTimeType(value: string) {
    this.themeService.setTimeType(value);
  }

  changeAmountType(value: string) {
    this.themeService.setAmountType(value);
  }

  signOut() {
    this.matbiaIdleService.stopActivity();
    this.localStorageDataService.logoutSession();
    this.matbiaObserver.setIsEntityId(false);
    this.localStorageDataService.removeEntityTokenSetting();
    this.localStorageDataService.removeReuestsCount();
    this.router.navigateByUrl(this.landingPageUrl, { onSameUrlNavigation: 'reload' });
  }

  displayName(): string {
    return this.localStorageDataService.getLoginUserFullName() || '';
  }

  displayBusinessName(): string {
    return this.localStorageDataService.getLoginUserBusinessName() || '';
  }

  displayLogo(): string {
    return this.localStorageDataService.getLoginUserOrgLogo() || '';
  }

  applyFilter(data: string) {
    this.themeService.searchInMatbia(data);
  }

  /**
   * Hide Header searchbar if want to hide searchbar for child route then pass second argument as false
   * @returns boolean
   */
  protected isSearchBarHide() {
    return (
      this.router.isActive('dashboard/add-funds', {
        paths: 'exact',
        fragment: 'ignored',
        queryParams: 'ignored',
        matrixParams: 'ignored',
      }) ||
      this.router.isActive('dashboard/donate', {
        paths: 'exact',
        fragment: 'ignored',
        queryParams: 'ignored',
        matrixParams: 'ignored',
      })
    );
  }

  protected isPrepaidVoucherHide() {
    return this.router.isActive('dashboard', {
      paths: 'exact',
      fragment: 'ignored',
      queryParams: 'ignored',
      matrixParams: 'ignored',
    });
  }

  protected isHeaderBannerVisible() {
    if (this.localStorageDataService.isDonor() || this.localStorageDataService.isBusinessDonor()) {
      return !this.isSearchBarHide();
    }

    return false;
  }
}
