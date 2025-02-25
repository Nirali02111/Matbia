import { CommonDataService } from '@commons/common-data-service.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { ChartConfiguration, TooltipItem } from 'chart.js';

import { DonationRequestObj, DonorTransactionObj, ScheduleObj } from 'src/app/models/panels';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { DonorDashboardService, DonorTransactionResponse } from '@services/API/donor-dashboard.service';
import { OrganizationDashboardAPIService } from '@services/API/organization-dashboard-api.service';
import { ThemeService } from 'src/app/@theme/theme.service';
import { PanelPopupsService } from './../popups/panel-popups.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';

import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';
import { DonorTokenAPIService, TokenResponse } from '@services/API/donor-token-api.service';
import { SettingAPIService } from '@services/API/setting-api.service';
import { MatbiaCardSettingService } from '@services/API/matbia-card-setting.service';
import { SharedModule } from '@matbia/shared/shared.module';
import { ScheduleRowItemComponent } from '@matbia/matbia-list-row-item/schedule-row-item/schedule-row-item.component';
import { TransactionRowItemComponent } from '@matbia/matbia-list-row-item/transaction-row-item/transaction-row-item.component';
import { ReportListComponent } from './report-list/report-list.component';
import { RequestRowItemComponent } from '@matbia/matbia-list-row-item/request-row-item/request-row-item.component';
import { DatePickerFilterComponent } from '@matbia/matbia-panel-shared/date-picker-filter/date-picker-filter.component';
import { NgChartsModule } from 'ng2-charts';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    SharedModule,
    ScheduleRowItemComponent,
    TransactionRowItemComponent,
    ReportListComponent,
    RequestRowItemComponent,
    DatePickerFilterComponent,
    MatbiaSkeletonLoaderComponentComponent,
    NgChartsModule,
    RequestRowItemComponent,
  ],
  providers: [CurrencyPipe, SearchPipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _matbiaSearchSubscriptions: Subscription = new Subscription();
  public searchSub = '';
  // tslint:disable-next-line: no-inferrable-types
  isLoading: boolean = false;

  isBatchVisible = false;
  isDevEnv = false;
  availableBalance = 0;
  presentBalance = 0;
  totalDeposits = 0;
  totalDonations = 0;
  depositPercentage = 0;
  donationPercentage = 0;

  // for Organization
  isOrganizationUser = false;
  pastDonations = 0;
  donationsGrowthPercentage = 0;
  fundingBalance = 0;

  topFiveCal: string | null = '';
  isFromTokenExpirySettings = false;

  selectedDonorDateRange: any = {
    fromDate: moment(new Date()).subtract(29, 'days').format('YYYY-MM-DD'),
    toDate: moment(new Date()).format('YYYY-MM-DD'),
  };

  selectedDateRange: any = {
    fromDate: moment(new Date()).subtract(29, 'days').format('YYYY-MM-DD'),
    toDate: moment(new Date()).format('YYYY-MM-DD'),
  };

  topOrganizationCount = 0;
  transactionListData: Array<DonorTransactionObj> = [];
  tokensListData: Array<DonorTransactionObj> = [];
  donationRequestListData: Array<DonationRequestObj> = [];
  scheduleListData: Array<ScheduleObj> = [];

  isBankAccountLinked = true;
  isCardSettingsSaved = true;
  topContentVoucherCls = '';
  showTokenExpirySettings: boolean = false;
  count: number = 0;
  // Chart
  // Doughnut
  public chartOption: ChartConfiguration<'doughnut'>['options'] = {
    cutout: '80%',

    layout: {
      padding: 5,
    },

    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: '#F9791D',
        borderColor: '#F9791D',
        multiKeyBackground: '#F9791D',
        callbacks: {
          label: (tooltipItem: TooltipItem<'doughnut'>) => {
            const label = tooltipItem.label;
            const orgCount = tooltipItem.dataset.data[tooltipItem.dataIndex];
            return `${label}: $${orgCount}`;
          },
          labelColor: (tooltipItem: TooltipItem<'doughnut'>) => {
            const arrayColm = ['#4046db', '#5ea835', '#6c278a', '#db4070', '#f9ad19'];
            const color = arrayColm[tooltipItem.dataIndex];
            return {
              borderColor: color,
              backgroundColor: color,
              borderWidth: 0,
              borderDash: [0, 0],
              borderRadius: 0,
              borderDashOffset: 0,
            };
          },
        },
      },
    },

    aspectRatio: screen.width < 768 ? 1 / 1 : 2,
  };

  public chartPlugin: ChartConfiguration<'doughnut'>['plugins'] = [
    {
      id: 'customPlugin',
      beforeDraw: (chart: any, _args: any, _options: any) => {
        const { width, height, ctx } = chart;
        const text = this.topFiveCal;
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        if (
          (this.localStorage.isDonor() || this.localStorage.isBusinessDonor()) &&
          this.topOrganizationCount > 0 &&
          this.isMobile
        ) {
          const topOrganizations = `Top ${this.topOrganizationCount}`;
          ctx.fillText(topOrganizations, textX + 10, textY - 15);
          ctx.fillText('Organizations', textX - 10, textY - 0);
          ctx.fillText(text, textX, textY + 25);
        } else ctx.fillText(text, textX, textY);
        ctx.save();
      },
    },
  ];

  public doughnutChartLabels: string[] = [];
  public doughnutChartData: ChartConfiguration<'doughnut'>['data']['datasets'] = [
    {
      data: [],
      backgroundColor: ['#5D62E0', '#6DC23D', '#812FA4', '#E05D85', '#FAB93A'],
      hoverBackgroundColor: ['#4046db', '#5ea835', '#6c278a', '#db4070', '#f9ad19'],
      hoverBorderColor: ['#4046db', '#5ea835', '#6c278a', '#db4070', '#f9ad19'],
      borderWidth: 0,
      hoverBorderWidth: 4,
    },
  ];

  public doughnutChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';

  // Organization Chart
  // Bar Chart
  public orgChartOption: ChartConfiguration<'bar'>['options'] = {
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ...this.getYAxesObj(),
      },
    },

    plugins: {
      tooltip: {
        backgroundColor: '#44479D',
        borderColor: '#44479D',
        displayColors: false,
        caretPadding: 0,
        caretSize: 0,

        callbacks: {
          title: () => {
            return '';
          },
          label: (tooltip: TooltipItem<'bar'>) => {
            const orgCount = tooltip.dataset.data[tooltip.dataIndex];
            return `$${orgCount}`;
          },
        },
      },
    },

    maintainAspectRatio: false,
    responsive: true,
  };

  public orgChartLabels: ChartConfiguration<'bar'>['data']['labels'] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  public orgChartData: ChartConfiguration<'bar'>['data']['datasets'] = [
    {
      data: [1000, 2578, 15000, 14211, 11980, 22012.42, 17450, 700, 9015, 7523, 13452, 8152],
      backgroundColor: '#C8C9EF',
      hoverBackgroundColor: '#5D62E0',
      hoverBorderColor: '#5D62E0',
      borderWidth: 0,
      hoverBorderWidth: 0,
      barThickness: 20,
      maxBarThickness: 20,
      borderRadius: {
        topLeft: 50,
        topRight: 50,
      },
    },
  ];

  public orgChartType: ChartConfiguration<'bar'>['type'] = 'bar';
  showAdditionalCard: boolean = false;
  isMobile: boolean = false;

  getYAxesObj(max = 50, stepSize = 10) {
    return {
      grid: {
        drawBorder: false,
      },
      suggestedMax: max,
      ticks: {
        stepSize,
        mirror: true,
        padding: 10,
        labelOffset: 10,
        callback: (value: any) => {
          return this.cp.transform(value, 'USD', '$', '1.0-2');
        },
      },

      beginAtZero: true,
    };
  }

  batchSubscription!: Subscription;

  constructor(
    private cp: CurrencyPipe,
    protected title: Title,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private themeService: ThemeService,
    private localStorage: LocalStorageDataService,
    private modalService: PanelPopupsService,
    private matbiaObserver: MatbiaObserverService,
    private donorDashboardAPI: DonorDashboardService,
    private donorTokenAPI: DonorTokenAPIService,
    private organizationDashboardAPI: OrganizationDashboardAPIService,
    private setting: SettingAPIService,
    private route: ActivatedRoute,
    private cardSettingService: MatbiaCardSettingService,
    public commonDataService: CommonDataService,
    private activeRoute: ActivatedRoute,
    public cdr: ChangeDetectorRef
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
    this.isMobile = screen.width < 768;
  }

  ngOnInit(): void {
    this.count = 1;
    this.title.setTitle('Matbia - Overview');
    if (this.localStorage.isDonor() || this.localStorage.isBusinessDonor()) {
      this.loadDonorDashboardData();
      let userHandle = this.localStorage.getLoginUserUserName();
      this.cardSettingService.getNewCard(userHandle).subscribe((res: any) => {
        if (res) this.showAdditionalCard = res.hasRequest;
      });

      this.route.queryParamMap.subscribe((params) => {
        if (params.has('expiredTokenSetting')) {
          this.openTokenSetting();
        }
      });

      this.getExpiredSetting();
    }

    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.isOrganizationUser = true;
      this.loadOrganizationDashboardData();
    }

    this.applySearchInTransactionList();

    this.matbiaObserver.updateIsBatchVisible();

    this.batchSubscription = this.matbiaObserver.batchVisible$.subscribe((val) => {
      this.isBatchVisible = val;
    });


    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
  }

  ngOnDestroy(): void {
    this._matbiaSearchSubscriptions.unsubscribe();
    this.batchSubscription.unsubscribe();
  }

  getAccountsRouterLink() {
    return this.pageRoute.getAccountsRouterLink();
  }

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  getCardsRouterLink() {
    return this.pageRoute.getCardsRouterLink();
  }

  getRequestAdditionalCardLink() {
    return this.pageRoute.getCardRequestRouterLink();
  }

  getAddAdditionalCardRouterLink() {
    return this.pageRoute.getAddAdditionalCardRouterLink();
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoute.getLinkNewAccountRouterLink();
  }

  getTransactionsRouterLink() {
    return this.pageRoute.getTransactionsRouterLink();
  }

  loadDonorDashboardData() {
    const username = this.localStorage.getLoginUserUserName();
    this.isLoading = true;
    this.donorDashboardAPI.getDashboard({ userHandle: username, ...this.selectedDonorDateRange }).subscribe(
      (res) => {
        this.setDashboard(res);
      },
      (_err) => {
        this.isLoading = false;
      }
    );
  }

  setDashboard(res: DonorTransactionResponse) {
    if (res) {
      this.localStorage.setReuestsCount(res.requestsCount);
      this.availableBalance = res.availableBalance || 0;
      this.presentBalance = res.presentBalance || 0;
      this.totalDeposits = res.totalDeposits || 0;
      this.totalDonations = res.totalDonations || 0;
      this.depositPercentage = res.depositPercentage || 0;
      this.donationPercentage = res.donationPercentage || 0;

      this.isBankAccountLinked = res.isBankAccountLinked;
      this.isCardSettingsSaved = res.isCardSettingsSaved;

      if (res.transactions) {
        this.transactionListData = res.transactions;
      }

      this.tokensListData = res.tokens || [];
      if (res.donationRequests) {
        const sortedList = res.donationRequests.sort((a, b) => {
          if (a.status === 'Pending' && b.status !== 'Pending') {
            return -1; // Move `"Pending"` to the top
          } else if (b.status === 'Pending' && a.status !== 'Pending') {
            return 1; // Keep `"Pending"` higher than other statuses
          }
          return 0; // Leave other statuses as-is
        });

        this.donationRequestListData = sortedList;
      }

      if (res.schedules) {
        this.scheduleListData = res.schedules;
      }

      const labelArray = [];
      const dataArray = [];
      let topTotalcounts = 0;

      if (res.organizationDonations) {
        this.topOrganizationCount = res.organizationDonations.length;

        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < res.organizationDonations.length; index++) {
          const element = res.organizationDonations[index];
          if (element.orgName && element.orgName.length > 20) {
            let colString = element.orgName.substring(0, 16);
            element.orgName = colString + '...';
          }
          labelArray.push(element.orgName);
          dataArray.push(element.donation);
          topTotalcounts += element.donation;
        }
      }

      this.doughnutChartLabels = labelArray;
      this.doughnutChartData[0].data = dataArray;

      this.topFiveCal = this.cp.transform(topTotalcounts);
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }

  loadOrganizationDashboardData() {
    const username = this.localStorage.getLoginUserUserName();
    this.isLoading = true;
    this.organizationDashboardAPI.getDashboard({ orgHandle: username, ...this.selectedDateRange }).subscribe(
      (res) => {
        if (res) {
          this.availableBalance = res.availableBalance || 0;

          this.presentBalance = res.presentBalance || 0;
          this.totalDonations = res.totalDonations || 0;
          this.pastDonations = res.pastDonations || 0;

          this.fundingBalance = res.fundingBalance || 0;

          this.donationsGrowthPercentage = res.donationsGrowthPercentage || 0;

          if (res.transactions) {
            this.transactionListData = res.transactions;
          }

          if (res.schedules) {
            this.scheduleListData = res.schedules;
          }

          const labelArray = [];
          const dataArray = [];

          if (res.periodWiseDonations) {
            // tslint:disable-next-line: prefer-for-of
            for (let index = 0; index < res.periodWiseDonations.length; index++) {
              const element = res.periodWiseDonations[index];
              labelArray.push(element.period);
              dataArray.push(element.donations || 0);
            }

            const max = Math.max.apply(
              Math,
              res.periodWiseDonations.map((o) => {
                return o.donations ? o.donations : 0;
              })
            );

            this.updateYAxis(max);
          }

          this.orgChartLabels = labelArray;
          this.updateBarChartData(dataArray);
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      },
      (_err) => {
        this.isLoading = false;
      }
    );
  }

  updateBarChartData(dataArray: Array<number> = []) {
    this.orgChartData = [
      {
        data: dataArray,
        backgroundColor: '#C8C9EF',
        hoverBackgroundColor: '#5D62E0',
        hoverBorderColor: '#5D62E0',
        borderWidth: 0,
        hoverBorderWidth: 0,
        barThickness: 20,
        maxBarThickness: 20,
        borderRadius: {
          topLeft: 50,
          topRight: 50,
        },
      },
    ];
  }

  updateYAxesStepSize(stepSize: number, max: number) {
    this.orgChartOption = {
      ...this.orgChartOption,
      scales: {
        ...this.orgChartOption?.scales,
        y: {
          ...this.getYAxesObj(max, stepSize),
        },
      },
    };
  }

  updateYAxis(max: number) {
    if (max < 10) {
      this.updateYAxesStepSize(2, 10);
      return;
    }

    if (max < 50) {
      this.updateYAxesStepSize(10, 50);
      return;
    }

    if (max < 100) {
      this.updateYAxesStepSize(20, 100);
      return;
    }

    if (max < 500) {
      this.updateYAxesStepSize(100, 500);
      return;
    }

    if (max < 1000) {
      this.updateYAxesStepSize(200, 1000);
      return;
    }

    if (max < 5000) {
      this.updateYAxesStepSize(1000, 5000);
      return;
    }

    if (max < 10000) {
      this.updateYAxesStepSize(2000, 10000);
      return;
    }

    if (max < 50000) {
      this.updateYAxesStepSize(10000, 50000);
      return;
    }

    if (max < 100000) {
      this.updateYAxesStepSize(20000, 100000);
      return;
    }

    if (max < 500000) {
      this.updateYAxesStepSize(100000, 500000);
      return;
    }
  }

  filterChange(event: any) {
    this.selectedDonorDateRange = event;
    if (this.localStorage.isDonor()) {
      this.loadDonorDashboardData();
      return;
    }

    this.selectedDateRange = event;
    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.loadOrganizationDashboardData();
      return;
    }
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent; active: {}[] }): void {}

  public chartHovered({ event, active }: { event: MouseEvent; active: {}[] }): void {}

  goToTransactionList() {
    this.router.navigate(this.pageRoute.getTransactionsRouterLink());
  }

  moreTransactionList() {
    this.router.navigate(this.pageRoute.getTransactionsRouterLink(), {
      state: {
        page: 2,
      },
    });
  }

  moreScheduleList() {
    this.router.navigate(this.pageRoute.getSchedulesRouterLink(), {
      state: {
        page: 2,
      },
    });
  }

  moreRequestList() {
    this.router.navigate(this.pageRoute.getRequestsRouterLink(), {
      state: {
        page: 2,
      },
    });
  }

  goToWithdrawFunds() {
    this.router.navigate(this.pageRoute.getWithdrawFundsRouterLink());
  }

  goToBatchClosingOption() {
    this.router.navigate(this.pageRoute.getBatchClosingOptionsRouterLink());
  }

  applySearchInTransactionList() {
    this._matbiaSearchSubscriptions = this.themeService.searchInMatbiaObservable.subscribe((val) => {
      this.searchSub = val;
    });
  }
  openTokenSetting() {
    const modalRef = this.modalService.openTokenSettingsPopup({
      centered: true,
      keyboard: true,
      windowClass: 'modal-tokan-setting',
      size: 'lg',
      scrollable: true,
    });

    modalRef.componentInstance.mode = 'popup';
  }

  getTokenData() {
    const username = this.localStorage.getLoginUserUserName();
    this.donorTokenAPI
      .getTokens({
        userHandle: username,
        fromDate: '',
        toDate: '',
      })
      .subscribe(
        (res: TokenResponse) => {
          this.localStorage.setEntityTokenSetting(res);
          this.matbiaObserver.updateIsBatchVisible();
          if (!this.commonDataService.isEntityId()) {
            this.matbiaObserver.setIsEntityId(false);
          }
          const haveboook = (res.tokens || []).filter((o) => o.bookNum != null);
          if (haveboook.length < 1) {
            return;
          }
          this.showTokenExpirySettings = true;
        },
        (err) => {
          console.log(err, 'err');
        }
      );
  }

  getExpiredSetting() {
    this.setting.getExpiredTokenSetting().subscribe(
      (res) => {
        if (!(res.entityID == 0 || res.entityID == null)) {
          this.matbiaObserver.setIsEntityId(true);

          return;
        }
        this.getTokenData();
      },
      (err) => {
        console.log(err, 'err');
      }
    );
  }

  displayName(): string {
    return this.localStorage.getLoginUserFullName() || '';
  }

  displayBusinessName(): string {
    return this.localStorage.getLoginUserBusinessName() || '';
  }
}
