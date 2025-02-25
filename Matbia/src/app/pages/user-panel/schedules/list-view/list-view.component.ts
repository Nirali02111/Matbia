import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Inject,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { MatbiaDataGridService, QueryFilter } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { SortableHeaderDirective, SortEvent } from '@matbia/matbia-directive/sortable-header.directive';

import { TransactionTypes } from '@enum/Transaction';
import { PageRouteVariable } from '@commons/page-route-variable';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { ScheduleAPIService } from '@services/API/schedule-api.service';
import { CommonAPIMethodService } from '@services/API/common-api-method.service';

import { ThemeService } from 'src/app/@theme/theme.service';
import { ScheduleObj } from 'src/app/models/panels';

import { TransactionRecurrenceObj } from 'src/app/models/common-api-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { ScheduleRowItemComponent } from '@matbia/matbia-list-row-item/schedule-row-item/schedule-row-item.component';
import { DatePickerFilterComponent } from '@matbia/matbia-panel-shared/date-picker-filter/date-picker-filter.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    SortableHeaderDirective,
    ScheduleRowItemComponent,
    DatePickerFilterComponent,
    MatbiaSkeletonLoaderComponentComponent,
  ],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class ListViewComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = false;

  availableBalance = 0;
  deposits = 0;
  donations = 0;
  presentBalance = 0;

  isNoMatchingRecord = false;
  isNoRecord = false;

  // for organization
  listOrgData: Array<ScheduleObj> = [];
  fundingBalance = 0;

  private _matbiaSearchSubscriptions: Subscription = new Subscription();

  selectedStatus = 'All';
  scheduleStatusList: Array<TransactionRecurrenceObj> = [
    {
      id: 0,
      name: 'All',
      description: 'All',
    },
  ];

  selectedType = 'All';
  scheduleTypeList: Array<{ id: string; label: string }> = [
    {
      id: 'All',
      label: 'All',
    },
    {
      id: TransactionTypes.DEPOSIT,
      label: TransactionTypes.DEPOSIT,
    },
    {
      id: TransactionTypes.DONATION,
      label: TransactionTypes.DONATION,
    },
  ];

  selectedDates: { fromDate: any; toDate: any } = {
    fromDate: null,
    toDate: null,
  };

  rows$!: Observable<Array<ScheduleObj>>;
  total$!: Observable<number>;

  @ViewChildren(SortableHeaderDirective)
  headers!: QueryList<SortableHeaderDirective>;

  constructor(
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private activateRouter: ActivatedRoute,
    private localStorage: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private themeService: ThemeService,
    private commonAPI: CommonAPIMethodService,
    private scheduleAPIService: ScheduleAPIService,

    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<ScheduleObj>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Schedules');
    this.commonAPI.getScheduleStatuses().subscribe((res) => {
      if (res && res.length !== 0) {
        this.scheduleStatusList = [
          {
            id: 0,
            name: 'All',
            description: 'All',
          },
          ...res,
        ];
      }
    });

    this.rows$ = this.gridService.rows$;
    this.total$ = this.gridService.total$;

    this.gridService.TableHeaders = [
      {
        colName: 'To/From',
        sortName: 'description',
      },
      {
        colName: 'Schedule #',
        sortName: 'scheduleNum',
      },
      {
        colName: 'Creation Date',
        sortName: 'firstCreatedDate',
      },
      {
        colName: 'Total Amount',
        sortName: 'totalAmount',
      },
      {
        colName: 'Type',
        sortName: 'transType',
      },
      {
        colName: 'Status',
        sortName: 'status',
      },
      {
        colName: 'Remaining',
        sortName: 'remaining',
      },
      {
        colName: 'Next Schedule Date',
        sortName: 'nextScheduleDate',
      },
      {
        colName: 'RepeatTimes',
        sortName: 'repeatTimes',
      },
      {
        colName: 'Frequency',
        sortName: 'frequency',
      },
      {
        colName: 'Amount',
        sortName: 'scheduleAmount',
      },
    ];

    this.gridService.setCurrencyColumns(['Total Amount', 'Amount']);

    this.loadData();

    this.applySearchInScheduleList();
  }

  ngAfterViewInit(): void {
    this.activateRouter.paramMap
      .pipe(map(() => window.history.state))
      .subscribe((data: { queryFilter: QueryFilter; navigationId: number; page: number }) => {
        if (data && data.queryFilter) {
          this.gridService.queryFilter = data.queryFilter;
        } else {
          this.gridService.queryFilter = { status: [], transType: [] };
        }

        this.changeDetectorRef.detectChanges();
      });

    this.gridService.rows$.subscribe((rows) => {
      if (rows.length !== 0) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this._matbiaSearchSubscriptions.unsubscribe();
    this.gridService.queryFilter = {
      status: [],
      transType: [],
    };
    this.gridService.page = 1;
    this.gridService.ListData = [];
  }

  getAutoDepositRouterLink() {
    return this.pageRoute.getAutoDepositRouterLink();
  }

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  loadData() {
    if (this.localStorage.isDonor() || this.localStorage.isBusinessDonor()) {
      this.loadDonorScheduleData();
    }

    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.loadOrganizationScheduleData();
    }
  }

  private applySearchInScheduleList() {
    this._matbiaSearchSubscriptions = this.themeService.searchInMatbiaObservable.subscribe((val) => {
      this.gridService.searchTerm = val;
    });
  }

  filterChange(event: any) {
    this.selectedDates = event;
    this.loadData();
  }

  onSelectStatus(data: { id: number; name: string }) {
    if (data) {
      if (data.name === 'All') {
        this.setQueryFilter([], [this.selectedType]);
        return;
      }

      this.setQueryFilter([data.name], [this.selectedType]);
      return;
    }
    this.setQueryFilter([], []);
  }

  onSelectType(data: { id: string; label: string }) {
    if (data) {
      if (data.label === 'All') {
        this.setQueryFilter([this.selectedStatus], []);
        return;
      }

      this.setQueryFilter([this.selectedStatus], [data.label]);

      return;
    }
    this.setQueryFilter([], []);
  }

  private setQueryFilter(status: Array<any>, transType: Array<any>) {
    this.gridService.queryFilter = {
      status: this.selectedStatus !== 'All' ? status : [],
      transType: this.selectedType !== 'All' ? transType : [],
    };
  }

  onSort({ column, columnKey, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.gridService.sortColumn = columnKey;
    this.gridService.sortDirection = direction;
  }

  private loadDonorScheduleData() {
    this.isLoading = true;
    this.scheduleAPIService.getDonorAll({ ...this.selectedDates }).subscribe(
      (res) => {
        this.isLoading = false;

        this.availableBalance = res.availableBalance || 0;
        this.deposits = res.deposits || 0;
        this.donations = res.donations || 0;
        this.presentBalance = res.presentBalance || 0;

        this.gridService.ListData = res.donorSchedules || [];

        if (res.returnMessage === 'No matching records') {
          this.isNoMatchingRecord = true;
        } else {
          this.isNoMatchingRecord = false;
        }

        if (res.returnMessage === 'No records') {
          this.isNoRecord = true;
        } else {
          this.isNoRecord = false;
        }
      },
      () => {
        this.isLoading = false;
        this.gridService.ListData = [];
      }
    );
  }

  private loadOrganizationScheduleData() {
    this.isLoading = true;
    this.scheduleAPIService.getOrgAll({ ...this.selectedDates }).subscribe(
      (res) => {
        this.isLoading = false;

        this.availableBalance = res.availableBalance || 0;
        this.fundingBalance = res.fundingBalance || 0;
        this.donations = res.donations || 0;
        this.presentBalance = res.presentBalance || 0;

        this.gridService.ListData = res.orgSchedules || [];
      },
      () => {
        this.isLoading = false;

        this.gridService.ListData = [];
      }
    );
  }

  openSearchAndFilter() {
    this.themeService.openSearchAndFilterMenu();
  }

  onExportScheduleData(event: any) {
    event.preventDefault();
    this.gridService.exportProcess('Schedule');
  }
}
