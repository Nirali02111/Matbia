import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import moment from 'moment';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { MatbiaDataGridService, QueryFilter } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { SortableHeaderDirective, SortEvent } from '@matbia/matbia-directive/sortable-header.directive';
import { Formats } from '@enum/Formats';
import { TransactionStatus, TransactionTypes } from '@enum/Transaction';
import { CommonDataService } from '@commons/common-data-service.service';
import { NotificationService } from '@commons/notification.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { DonorTransactionObj, OrganizationTransactionObj } from 'src/app/models/panels';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { OrganizationTransactionAPIService } from '@services/API/organization-transaction-api.service';
import { BatchAPIService, BatchDetailObj } from '@services/API/batch-api.service';
import { ThemeService } from 'src/app/@theme/theme.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import { ListPageFilterComponent } from '@matbia/matbia-panel-shared/list-page-filter/list-page-filter.component';
import { TransactionRowItemComponent } from '@matbia/matbia-list-row-item/transaction-row-item/transaction-row-item.component';
import { DatePickerFilterComponent } from '@matbia/matbia-panel-shared/date-picker-filter/date-picker-filter.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    SortableHeaderDirective,
    ListPageFilterComponent,
    TransactionRowItemComponent,
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
  private haveQueryFilter = false;
  isBatchVisible = false;

  private _matbiaSearchSubscriptions: Subscription = new Subscription();

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;
  // tslint:disable-next-line: no-inferrable-types
  isLoading: boolean = false;

  // for donor
  listData: Array<DonorTransactionObj> = [];
  isDevEnv = false;
  availableBalance = 0;
  deposits = 0;
  donations = 0;

  // for organization
  isOrganizationUser = false;
  listOrgData: Array<OrganizationTransactionObj> = [];
  presentBalance = 0;
  fundingBalance = 0;

  selectedStatus = 'All';
  selectedTypes = 'All';

  selectedDates: { fromDate: any; toDate: any } = {
    fromDate: moment(new Date()).subtract(29, 'days').format('YYYY-MM-DD'),
    toDate: moment(new Date()).format('YYYY-MM-DD'),
  };

  defaultSelectedRange = '3';

  batchDetails: BatchDetailObj | null = null;
  batchNum: number | null = null;

  transactions$!: Observable<Array<DonorTransactionObj>>;
  total$!: Observable<number>;

  @ViewChildren(SortableHeaderDirective)
  headers!: QueryList<SortableHeaderDirective>;

  @ViewChild('tableHead', { static: false }) tableHead!: ElementRef;
  @ViewChild('filterDrpdwnForMobile', { static: false }) transactionTemplate!: ElementRef;
  @ViewChild('datePickerFilterTmp', { static: false }) datePickerFilterTmp!: ElementRef;

  transactionStatusArrayExceptDecline: Array<string> = Object.values(TransactionStatus).filter(
    (status) => status !== TransactionStatus.DECLINED
  );
  transactionTypeMobile!: { id: string; label: string };
  isMobile: boolean = false;
  transactionStatusMobile!: { id: string; label: string };
  modalRef!: NgbModalRef;
  modalOptions: NgbModalOptions = {};
  isTransactionTypeOpen: boolean = false;
  isTransactionStatusOpen: boolean = false;

  constructor(
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private activateRouter: ActivatedRoute,
    private themeService: ThemeService,
    public commonDataService: CommonDataService,
    private localStorage: LocalStorageDataService,
    private notification: NotificationService,
    private matbiaObserver: MatbiaObserverService,
    private panelPopupService: PanelPopupsService,
    private donorTransactionAPI: DonorTransactionAPIService,

    private batchAPI: BatchAPIService,
    private modal_service: NgbModal,
    private organizationTransactionAPI: OrganizationTransactionAPIService,

    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<DonorTransactionObj | OrganizationTransactionObj>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.modalOptions = {
      keyboard: true,
      size: 'md',
      windowClass: 'modal-filter',
      fullscreen: 'md',
    };

    this.isMobile = screen.width < 768;
    this.title.setTitle('Matbia - Transactions');
    this.transactions$ = this.gridService.rows$ as Observable<DonorTransactionObj[]>;
    this.total$ = this.gridService.total$;

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    if (this.localStorage.isDonor()) {
      this.gridService.TableHeaders = [
        {
          colName: 'Transaction #',
          sortName: 'refNum',
        },
        {
          colName: 'Card #',
          sortName: 'cardLast4Digit',
        },
        {
          colName: 'Creation Date',
          sortName: 'transDate',
        },
        {
          colName: 'Completed Date',
          sortName: 'completedDate',
        },
        {
          colName: 'Org Name',
          sortName: 'organization',
        },
        {
          colName: 'Type',
          sortName: 'transType',
        },
        {
          colName: 'Amount',
          sortName: 'amount',
        },
        {
          colName: 'Status',
          sortName: 'transStatus',
        },
        {
          colName: 'Collector',
          sortName: 'collector',
        },
        {
          colName: 'Method',
          sortName: 'method',
        },
        {
          colName: 'Source',
          sortName: 'source',
        },
        {
          colName: 'Note field',
          sortName: 'note',
        },
        {
          colName: 'Running balance',
          sortName: 'balance',
        },
      ];
    }

    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.isOrganizationUser = true;
      this.gridService.TableHeaders = [
        {
          colName: 'Transaction #',
          sortName: 'refNum',
        },
        {
          colName: 'Creation Date',
          sortName: 'transDate',
        },
        {
          colName: 'Completed Date',
          sortName: 'completedDate',
        },
        {
          colName: 'Donor Name',
          sortName: 'source',
        },
        {
          colName: 'Type',
          sortName: 'transType',
        },
        {
          colName: 'Amount',
          sortName: 'amount',
        },
        {
          colName: 'Status',
          sortName: 'transStatus',
        },
        {
          colName: 'Collector',
          sortName: 'collector',
        },
        {
          colName: 'Note',
          sortName: 'note',
        },
        {
          colName: 'External ID',
          sortName: 'externalTransactionId',
        },
        {
          colName: 'Card ending in',
          sortName: 'cardNum',
        },
        {
          colName: 'Method',
          sortName: 'method',
        },
        {
          colName: 'MID',
          sortName: 'aliasExternalID',
        },
        {
          colName: "Donor's phone number",
          sortName: 'phoneNum',
        },
        {
          colName: 'Batch #',
          sortName: 'batchNum',
        },
        {
          colName: 'Campaign Name',
          sortName: 'campaignName',
        },
      ];
    }

    this.gridService.setCurrencyColumns(['Amount', 'Running balance']);

    this.applySearchInTransactionList();

    this.matbiaObserver.batchVisible$.subscribe((val) => {
      this.isBatchVisible = val;
    });

    this.activateRouter.queryParamMap.subscribe((params) => {
      const batchNum = params.get('batchNum');
      const firstTransDate = params.get('firstTransDate');
      const lastTransDate = params.get('lastTransDate');
      const isInBatchClicked = params.get('isInBatchClicked');
      if (batchNum) {
        this.batchNum = +batchNum;

        if (firstTransDate && lastTransDate) {
          this.selectedDates = {
            fromDate: moment(firstTransDate).local().format(Formats.DATE_SHORT_FORMAT),
            toDate: moment(lastTransDate).local().format(Formats.DATE_SHORT_FORMAT),
          };
        }

        if (isInBatchClicked) {
          this.selectedDates = {
            fromDate: null,
            toDate: null,
          };
        }

        this.defaultSelectedRange = '6';
        this.gridService.queryFilter = {
          method: [],
          transStatus: [],
          transType: [],
          batchNum: [this.batchNum],
        };

        if (!isInBatchClicked) {
          this.getTransactionList(true);
        }

        this.getBatchDetails();
        this.changeDetectorRef.detectChanges();
        return;
      }
      this.getTransactionList(true);
    });
  }

  ngAfterViewInit(): void {
    this.activateRouter.paramMap
      .pipe(map(() => window.history.state))
      .subscribe((data: { queryFilter: QueryFilter; navigationId: number; page: number }) => {
        if (data && data.queryFilter) {
          this.haveQueryFilter = true;
          this.gridService.queryFilter = data.queryFilter;
        } else {
          this.gridService.queryFilter = { method: [], transStatus: [], transType: [], batchNum: [] };
        }

        this.changeDetectorRef.detectChanges();
      });

    this.gridService.rows$.subscribe((rows) => {
      if (rows.length !== 0) {
        window.scrollTo(0, 0);
      }
    });

    const transDateHeader = this.headers.find((header) => {
      if (header.sortName === 'transDate') {
        return true;
      }
      return false;
    });

    if (transDateHeader) {
      transDateHeader.setManually('desc');
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this._matbiaSearchSubscriptions.unsubscribe();
    this.gridService.queryFilter = { method: [], transStatus: [], transType: [], batchNum: [] };
    this.gridService.ListData = [];
    this.gridService.page = 1;
  }

  openSearchAndFilter() {
    this.themeService.openSearchAndFilterMenu();
  }

  getTransactionList(init = false) {
    if (this.localStorage.isDonor()) {
      this.refreshDonorTransaction(init);
      return;
    }

    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.refreshOrganizationTransaction(init);
    }
  }

  filterChange(event: any) {
    let { fromDate, toDate, selectedDatesDrp } = event;
    this.selectedDates = { fromDate, toDate };
    this.defaultSelectedRange = selectedDatesDrp;
    this.getTransactionList();
    this.closeModal();
  }

  applySearchInTransactionList() {
    this._matbiaSearchSubscriptions = this.themeService.searchInMatbiaObservable.subscribe((val) => {
      this.gridService.searchTerm = val;
    });
  }

  onSearch(val: string) {
    this.gridService.searchTerm = val;
  }

  refreshDonorTransaction(init = false) {
    const username = this.localStorage.getLoginUserUserName();
    this.isLoading = true;

    this.donorTransactionAPI.getAll({ userHandle: username, ...this.selectedDates }).subscribe(
      (response) => {
        this.isLoading = false;
        if (!response) {
          this.gridService.ListData = [];
          return;
        }
        if (response) {
          this.listData = response.transactions;
          this.availableBalance = response.availableBalance || 0;
          this.deposits = response.deposits || 0;
          this.donations = response.donations || 0;

          if (init && !this.haveQueryFilter) {
            this.gridService.queryFilter = {
              method: [],
              transStatus: [],
              transType: [],
            };
          }
          this.gridService.ListData = this.listData || [];
        }
      },
      () => {
        this.isLoading = false;
        this.gridService.ListData = [];
      }
    );
  }

  refreshOrganizationTransaction(init = false) {
    const username = this.localStorage.getLoginUserUserName();
    this.isLoading = true;

    const apiPayload = this.batchNum
      ? { orgHandle: username, ...this.selectedDates, batchNum: this.batchNum }
      : {
        orgHandle: username,
        ...this.selectedDates,
      };

    this.organizationTransactionAPI.getAll(apiPayload).subscribe(
      (response) => {
        this.isLoading = false;

        if (!response) {
          this.gridService.ListData = [];
          return;
        }
        if (response) {
          this.listOrgData = response.transactions;
          this.availableBalance = response.availableBalance || 0;
          this.presentBalance = response.presentBalance || 0;
          this.fundingBalance = response.fundingBalance || 0;
          if (init && !this.haveQueryFilter) {
            this.gridService.queryFilter = {
              method: [],
              transStatus: this.transactionStatusArrayExceptDecline,
              transType: [],
            };
          }
          if (this.batchNum) {
            this.gridService.queryFilter = {
              method: [],
              transStatus: [],
              transType: [],
              batchNum: [this.batchNum],
            };
          }

          this.gridService.ListData = this.listOrgData || [];
        }
      },
      () => {
        this.isLoading = false;
        this.gridService.ListData = [];
      }
    );
  }

  private getBatchDetails() {
    this.isLoading = true;
    this.batchAPI.getBatchDetails({ ...this.selectedDates, batchNum: this.batchNum }).subscribe(
      (res) => {
        this.isLoading = false;
        if (res && res.batchDetailList.length !== 0) {
          this.batchDetails = res.batchDetailList[0];
          this.selectedDates = {
            fromDate: moment(this.batchDetails.firstTransDate).format(Formats.DATE_SHORT_FORMAT),
            toDate: moment(this.batchDetails.lastTransDate).format(Formats.DATE_SHORT_FORMAT),
          };
          this.getTransactionList(true);
        }
      },
      () => { }
    );
  }

  onExportTransactionData() {
    this.gridService.exportProcess('Transaction');
  }

  onStatementTransactionData() {
    const username = this.localStorage.getLoginUserUserName();
    const modalRef = this.panelPopupService.openPDFViewPopup();
    modalRef.componentInstance.title = 'Print Statement';

    this.donorTransactionAPI.getStatement(username, this.selectedDates.fromDate, this.selectedDates.toDate).subscribe(
      (response) => {
        if (!response) {
          return;
        }
        modalRef.componentInstance.pdfUrl = response;
      },
      (error) => {
        modalRef.close();
        this.notification.showError(error.error);
      }
    );
  }

  onBulkReceiptsTransactionData() {
    const username = this.localStorage.getLoginUserUserName();

    const modalRef = this.panelPopupService.openPDFViewPopup();
    modalRef.componentInstance.title = 'Print Receipts';

    this.donorTransactionAPI
      .getBulkDepositReceipt(username, this.selectedDates.fromDate, this.selectedDates.toDate)
      .subscribe(
        (response) => {
          if (!response) {
            return;
          }

          modalRef.componentInstance.pdfUrl = response;
        },
        (error) => {
          modalRef.close();
          this.notification.showError(error.error);
        }
      );
  }

  onSelectStatus(data: { id: string; label: string }, filterData: boolean) {
    if (this.isMobile && !filterData) {
      this.transactionStatusMobile = data;
      return;
    }
    if (data) {
      if (data.id === 'All') {
        this.setQueryFilter([], [this.selectedTypes]);
        return;
      }

      setTimeout(() => {
        this.setQueryFilter([data.id], [this.selectedTypes]);
      }, 0);
      return;
    }

    this.setQueryFilter([], []);
  }

  onSelectTypes(data: { id: string; label: string }, filterData: boolean) {
    if (this.isMobile && !filterData) {
      this.transactionTypeMobile = data;
      return;
    }
    if (data) {
      if (data.id === 'All') {
        this.setQueryFilter([this.selectedStatus], []);
        return;
      }

      if (data.id === TransactionTypes.REDEEMED_And_MATBIA_FEE) {
        this.setQueryFilter([this.selectedStatus], [TransactionTypes.REDEEMED, TransactionTypes.MATBIA_FEE]);
        return;
      }
      setTimeout(() => {
        this.setQueryFilter([this.selectedStatus], [data.id]);
      }, 0);
      return;
    }

    this.setQueryFilter([], []);
  }

  private getFilterSelectedStatus(transStatus: Array<any>) {
    if (!this.selectedStatus || this.selectedStatus === 'All') {
      if (this.localStorage.isOrganization()) {
        return this.transactionStatusArrayExceptDecline;
      }
      return [];
    }
    return transStatus;
  }

  private getFilterSelectedType(transType: Array<any>) {
    if (this.selectedTypes === TransactionTypes.REDEEMED_And_MATBIA_FEE) {
      return [TransactionTypes.REDEEMED, TransactionTypes.MATBIA_FEE];
    }

    return this.selectedTypes !== 'All' ? transType : [];
  }

  private setQueryFilter(transStatus: Array<any>, transType: Array<any>) {
    const hasTokenDetails = this.listData.some(item => Array.isArray(item.tokenBookDetails?.tokenBookList));
    const showStatus = this.listData.some(item =>
      item.tokenBookDetails?.tokenBookList.filter((it) => it.transStatus === "Success"));
    const status = hasTokenDetails && showStatus && transStatus[0] == 'Success' ? [...transStatus, "Expired"] : transStatus;
    this.gridService.queryFilter = {
      method: [],
      transStatus: this.getFilterSelectedStatus(status),
      transType: this.getFilterSelectedType(transType),
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

  openFilterPopup() {
    this.modalRef = this.modal_service.open(this.transactionTemplate, this.modalOptions);
  }

  openDateRangePopup() {
    this.modalRef = this.modal_service.open(this.datePickerFilterTmp, this.modalOptions);
  }

  filterTransactions() {
    this.onSelectTypes(this.transactionTypeMobile, true);
    this.onSelectStatus(this.transactionStatusMobile, true);
    this.closeModal();
  }

  closeModal() {
    this.modalRef.close();
  }
}
