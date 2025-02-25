import { LocalStorageDataService } from './../../../../commons/local-storage-data.service';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Inject,
  ViewChildren,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { MatbiaDataGridService, QueryFilter, sort } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { SortableHeaderDirective, SortEvent } from '@matbia/matbia-directive/sortable-header.directive';
import { RequestStatus } from '@enum/Request';
import { CommonDataService } from '@commons/common-data-service.service';
import { DonationRequestAPIService } from '@services/API/donation-request-api.service';
import { ThemeService } from 'src/app/@theme/theme.service';
import { DonationRequestObj } from 'src/app/models/panels';
import { MatbiaObserverService } from '@commons/matbia-observer.service';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import moment from 'moment';
import { Assets } from '@enum/Assets';
import { NotificationService } from '@commons/notification.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

import { SharedModule } from '@matbia/shared/shared.module';
import { ListPageFilterComponent } from '@matbia/matbia-panel-shared/list-page-filter/list-page-filter.component';
import { RequestRowItemComponent } from '@matbia/matbia-list-row-item/request-row-item/request-row-item.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    ListPageFilterComponent,
    SortableHeaderDirective,
    RequestRowItemComponent,
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
  batchedThisMonth = 0;
  presentBalance = 0;

  isNoMatchingRecord = false;
  isNoRecord = false;
  isOpenRequestCollapse = false;
  isSnoozedRequestCollapse = true;
  isClosedRequestCollapse = true;
  isBulkDonate: boolean = false;
  selectedRequestsList: any[] = [];

  selectedStatus = {
    id: RequestStatus.PENDING,
    label: 'Pending',
  };
  private _matbiaSearchSubscriptions: Subscription = new Subscription();

  selectedDates: { fromDate: any; toDate: any } = {
    fromDate: null,
    toDate: null,
  };

  rows$!: Observable<Array<DonationRequestObj>>;
  filteredOpenRequests$!: Observable<Array<DonationRequestObj>>;
  filteredSnoozedRequests$!: Observable<Array<DonationRequestObj>>;
  filteredClosedRequests$!: Observable<Array<DonationRequestObj>>;
  total$!: Observable<number>;
  dataLoading$!: Observable<boolean>;

  @ViewChildren(SortableHeaderDirective)
  headers!: QueryList<SortableHeaderDirective>;
  userType: any;
  isDevEnv: boolean = false;
  isProdEnv: boolean = false;
  status: any;
  selectAllRequest: boolean = false;
  profileIcon = Assets.PROFILE_IMAGE;

  modalRef!: NgbModalRef;
  bulkDonateForm: FormGroup = new FormGroup({});
  showMinValueError: boolean = false;
  closedRequestsCount: number = 0;

  get IsPendingOrSnoozed() {
    if (this.selectedStatus && this.selectedStatus.id) {
      if (this.selectedStatus.id === RequestStatus.PENDING || this.selectedStatus.id === RequestStatus.SNOOZED) {
        return true;
      }
      return false;
    }
    return false;
  }

  get totalAmount() {
    return this.selectedRequestsList.reduce((acc: number, request: any) => (acc += request.donationAmount), 0);
  }

  get bulkDonateAmount() {
    return this.bulkDonateForm.get('bulkDonateAmount');
  }

  get distributionType() {
    return this.bulkDonateForm.get('distributionType');
  }

  get maxDonationAmount() {
    return this.bulkDonateForm.get('maxDonationAmount');
  }

  get minDonationAmount() {
    return this.bulkDonateForm.get('minDonationAmount');
  }

  constructor(
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private activateRouter: ActivatedRoute,
    private themeService: ThemeService,
    private donationRequestAPI: DonationRequestAPIService,
    public commonDataService: CommonDataService,
    private localStorage: LocalStorageDataService,
    private matbiaObserver: MatbiaObserverService,
    private donorTransactionService: DonorTransactionAPIService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private popupService: PanelPopupsService,
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<DonationRequestObj>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Requests');
    this.rows$ = this.gridService.rows$;
    this.total$ = this.gridService.total$;
    this.dataLoading$ = this.gridService.loading$;
    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.gridService.TableHeaders = [
        {
          colName: 'Date & Time',
          sortName: 'createdDate',
        },
        {
          colName: 'Donor Name',
          sortName: 'donorName',
          formateValue: (o: any) => {
            return `${o.donorName}
               `;
          },
        },
        {
          colName: 'Source',
          sortName: 'method',
        },
        {
          colName: 'Status',
          sortName: 'status',
        },
        {
          colName: 'Amount',
          sortName: 'amount',
        },
      ];
    } else {
      this.gridService.TableHeaders = [
        {
          colName: 'Request #',
          sortName: 'donationRequestId',
        },
        {
          colName: 'Creation Date',
          sortName: 'createdDate',
        },
        {
          colName: 'Donor Name',
          sortName: 'donorFullName',
          formateValue: (o: DonationRequestObj) => {
            return `${o.donorFirstName} ${o.donorLastName}`;
          },
        },
        {
          colName: 'Organization Name',
          sortName: 'orgName',
        },
        {
          colName: 'Amount',
          sortName: 'amount',
        },
      ];
    }

    this.gridService.setCurrencyColumns(['Amount']);
    this.gridService.Pagination = false;
    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
    this.matbiaObserver.prodMode$.subscribe((val) => {
      this.isProdEnv = val;
    });
    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.getOrgRequestData();
    } else {
      this.getRequestData(false);
    }

    this.applySearchInRequestList();
  }

  ngAfterViewInit(): void {
    this.activateRouter.paramMap
      .pipe(map(() => window.history.state))
      .subscribe((data: { queryFilter: QueryFilter; navigationId: number; page: number }) => {
        if (data && data.queryFilter) {
          this.gridService.queryFilter = data.queryFilter;
        } else {
          this.gridService.queryFilter = { status: [] };
        }

        this.changeDetectorRef.detectChanges();
      });

    this.gridService.rows$.subscribe((rows) => {
      if (rows.length !== 0) {
        window.scrollTo(0, 0);
      }
    });
  }

  onStatus(event: any) {
    this.status = event.label;
    if (event) {
      if (event.label === 'All') {
        this.gridService.queryFilter = { status: [] };
        return;
      }
      if (this.status == 'FulFilled') {
        this.isClosedRequestCollapse = false;
        this.isSnoozedRequestCollapse = true;
        this.isOpenRequestCollapse = true;
      }
      if (this.status == 'Pending') {
        this.isOpenRequestCollapse = false;
        this.isSnoozedRequestCollapse = true;
        this.isClosedRequestCollapse = true;
      }
      if (this.status == 'Snoozed') {
        this.isSnoozedRequestCollapse = false;
        this.isOpenRequestCollapse = true;
        this.isClosedRequestCollapse = true;
      }
      this.gridService.queryFilter = { status: [event.label] };
      return;
    }
    this.gridService.queryFilter = { status: [] };
  }
  ngOnDestroy(): void {
    this._matbiaSearchSubscriptions.unsubscribe();
    this.gridService.page = 1;
    this.gridService.ListData = [];
  }

  openSearchAndFilter() {
    this.themeService.openSearchAndFilterMenu();
  }

  filterChange(event: any) {
    this.selectedDates = event;
    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) {
      this.getOrgRequestData();
    } else {
      this.getRequestData(true);
    }
  }

  applySearchInRequestList() {
    this._matbiaSearchSubscriptions = this.themeService.searchInMatbiaObservable.subscribe((val) => {
      this.gridService.searchTerm = val;
    });
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

  getRequestData(init = false) {
    this.isLoading = true;
    this.donationRequestAPI.getAllRequest({ ...this.selectedDates }).subscribe(
      (res) => {
        this.isLoading = false;

        this.availableBalance = res.availableBalance || 0;
        this.deposits = res.deposits || 0;
        this.donations = res.donations || 0;
        this.presentBalance = res.presentBalance || 0;

        if (init) {
          this.gridService.queryFilter = { status: [RequestStatus.PENDING] };
        }

        this.gridService.ListData = res.donationRequests || [];

        this.filteredOpenRequests$ = this.rows$.pipe(
          map((rows: DonationRequestObj[]) =>
            rows.filter((row) => {
              return row.status == 'Pending';
            })
          )
        );

        this.filteredSnoozedRequests$ = this.rows$.pipe(
          map((rows: DonationRequestObj[]) =>
            rows.filter((row) => {
              return row.status == 'Snoozed';
            })
          )
        );

        this.filteredClosedRequests$ = this.rows$.pipe(
          map((rows: DonationRequestObj[]) => {
            const fulfilledRequests = rows.filter((row) => row.status === 'FulFilled');
            const isTransDateSorted = this.headers?.some(
              (header) => header.sortName == 'transDate' && !!header.direction
            );

            const sortedRequests = isTransDateSorted ? fulfilledRequests : sort(fulfilledRequests, 'transDate', 'desc');

            this.closedRequestsCount = sortedRequests.length;

            return sortedRequests;
          })
        );

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
      }
    );
  }
  getOrgRequestData() {
    if (!this.isProdEnv) {
      this.donationRequestAPI.getAllOrgRequest({ ...this.selectedDates }).subscribe(
        (res) => {
          if (res) {
            this.availableBalance = res.availableBalance || 0;
            this.donations = res.donations || 0;
            this.batchedThisMonth = res.batchedThisMonth || 0;
            (this.gridService.ListData as any) = res.requests || [];
            if (res.requests == null) {
              this.isNoRecord = true;
            } else {
              this.isNoRecord = false;
            }
          }

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
        }
      );
    } else {
    }
  }
  onExportRequestData(event: any) {
    event.preventDefault();
    this.gridService.exportProcess('Request');
  }

  onSelectStatus(data: { id: string; label: string }) {
    if (data) {
      if (data.id === 'All') {
        this.gridService.queryFilter = { status: [] };
        return;
      }

      this.gridService.queryFilter = { status: [data.id] };
      return;
    }
    this.gridService.queryFilter = { status: [] };
  }

  onExportTransactionData() {
    this.gridService.exportProcess('Request');
  }
  onSearch(value: string) {
    this.gridService.searchTerm = value;
  }

  onSelectTypes(data: any) {
    const filterRequests = (status: string, tokenCheck: boolean | null) => {
      return this.rows$.pipe(
        map((rows: DonationRequestObj[]) =>
          rows.filter(
            (row) =>
              row.status === status &&
              (tokenCheck === null || (tokenCheck ? this.isSourceToken(row.method) : !this.isSourceToken(row.method)))
          )
        )
      );
    };

    switch (data.id) {
      case 'All':
        this.filteredOpenRequests$ = filterRequests('Pending', null); // No filter on token/card
        this.filteredSnoozedRequests$ = filterRequests('Snoozed', null);
        this.filteredClosedRequests$ = filterRequests('FulFilled', null);
        break;

      case 'Card':
        this.filteredOpenRequests$ = filterRequests('Pending', false); // Filter only for card
        this.filteredSnoozedRequests$ = filterRequests('Snoozed', false);
        this.filteredClosedRequests$ = filterRequests('FulFilled', false);
        break;

      case 'Token':
        this.filteredOpenRequests$ = filterRequests('Pending', true); // Filter only for token
        this.filteredSnoozedRequests$ = filterRequests('Snoozed', true);
        this.filteredClosedRequests$ = filterRequests('FulFilled', true);
        break;
    }
  }

  isSourceToken(method: string | null | undefined): boolean {
    return !!method && method.includes('Token');
  }

  addRequestToBulkDonate(request: any) {
    let reqFound = this.selectedRequestsList.findIndex((item) => item.donationRequestId == request.donationRequestId);
    if (reqFound == -1 && request.selected) {
      this.selectedRequestsList.push({ ...request, donationAmount: +request.donationAmount });
    } else if (!request.selected) {
      this.selectedRequestsList.splice(reqFound, 1);
    } else {
      let requestObj = this.selectedRequestsList[reqFound];
      this.selectedRequestsList[reqFound] = {
        ...requestObj,
        donationAmount: +request.donationAmount,
        note: request.note,
      };
    }
  }

  selecteAllRequests(event: any) {
    this.selectAllRequest = event.target.checked;
  }

  bulkDonate() {
    let donationReqPayload = this.setBulkDonatePayload();

    this.donorTransactionService.bulkFullfillRequests(donationReqPayload).subscribe(() => {
      this.closeModal();
      this.refreshList();
    });
  }

  /** Refresh the request list after bulkupdate */
  refreshList() {
    if (this.localStorage.isBusiness() || this.localStorage.isOrganization()) this.getOrgRequestData();
    else this.getRequestData();

    this.isBulkDonate = false;
    this.selectedRequestsList = [];
  }

  setBulkDonatePayload() {
    let selectedRequests = this.selectedRequestsList.map(({ selected, ...req }) => req);
    return {
      donorHandle: this.localStorage.getLoginUserUserName(),
      createdBy: +this.localStorage.getLoginUserId(),
      donationRequests: selectedRequests,
      transDate: moment(new Date()).toISOString(),
    };
  }

  onToggleBulkDonate() {
    if (this.isBulkDonate) {
      this.document.body.classList.add('bulk-donate-active');
    } else {
      this.document.body.classList.remove('bulk-donate-active');
    }
    this.selectedRequestsList = [];
  }

  /** Confirmation Popup for bulk donate */
  openPopup(template: TemplateRef<any>, modalClass: string) {
    this.modalRef = this.modalService.open(template, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: `modal-main ${modalClass}`,
      size: 'md',
      scrollable: true,
      fullscreen: 'md',
    });
  }

  closeModal() {
    this.modalRef.close();
  }

  applyAmountToOrgs() {
    if (this.bulkDonateForm.invalid) return;
    if (this.distributionType?.value == 'sendEach') {
      this.selectedRequestsList.forEach((req) => (req.donationAmount = +this.bulkDonateAmount?.value));
    } else if (this.distributionType?.value == 'divideEqually') {
      if (this.bulkDonateAmount?.value / this.selectedRequestsList.length < 0.25) {
        this.showMinValueError = true;
        return;
      }
      this.showMinValueError = false;
      this.selectedRequestsList.forEach(
        (req) => (req.donationAmount = this.bulkDonateAmount?.value / this.selectedRequestsList.length)
      );
    } else if (this.distributionType?.value == 'divideRandomly') {
      let remainingAmount = +this.bulkDonateAmount?.value;
      this.selectedRequestsList.forEach((req) => {
        let randomAmount = this.getRandomNumberBetween(
          +this.minDonationAmount?.value,
          +this.maxDonationAmount?.value,
          +remainingAmount
        );
        remainingAmount -= randomAmount;
        req.donationAmount = randomAmount;
      });
    }

    this.selectedRequestsList = [...this.selectedRequestsList];
    this.closeModal();
  }

  getRandomNumberBetween(min: number, max: number, limit: number): number {
    // Ensure max doesn't exceed the limit
    max = Math.min(max, limit);

    // Generate random number between min and adjusted max
    let amount = Math.floor(Math.random() * (max - min + 1)) + min;
    amount = amount > max ? max : amount;
    return amount;
  }

  onDismissed() {
    this.doUpdate(RequestStatus.DISMISSED, new Date().toISOString());
  }

  OpenReminder(event: any) {
    event.preventDefault();
    const modalRef = this.popupService.openSetReminder();
    modalRef.componentInstance.setSnoozeDate.subscribe((val: string) => {
      this.doUpdate(RequestStatus.SNOOZED, val);
    });
  }

  private doUpdate(status: string, snoozeDate: string) {
    const loader = this.notification.initLoadingPopup();
    loader.then(() => {
      this.refreshList();
    });

    this.donationRequestAPI
      .updateStatus({
        donationRequestId: 0,
        status,
        snoozeDate,
        donationRequestIds: this.selectedRequestsList.map((req) => req.donationRequestId),
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  initBulkDonateForm() {
    this.bulkDonateForm = this.fb.group({
      distributionType: ['', Validators.required],
      bulkDonateAmount: [0, Validators.required],
      maxDonationAmount: [0],
      minDonationAmount: [0],
    });
  }

  Cancel() {
    this.isBulkDonate = false;
  }
}
