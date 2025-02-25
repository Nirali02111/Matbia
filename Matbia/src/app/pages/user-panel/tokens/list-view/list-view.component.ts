import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { SortableHeaderDirective } from '@matbia/matbia-directive/sortable-header.directive';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DonorTokenAPIService, TokenObj } from '@services/API/donor-token-api.service';
import { Observable } from 'rxjs';
import { TokensObj } from 'src/app/models/panels';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import JsBarcode from 'jsbarcode';
import { TokensPdfComponent } from '@matbia/matbia-panel-shared/tokens-pdf/tokens-pdf.component';
import { Title } from '@angular/platform-browser';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { TokenStatus } from '@enum/Token';
interface filterData {
  id: string;
  label: string;
  isChecked: boolean;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { SearchInputComponent } from '@matbia/matbia-input/search-input/search-input.component';
import { TokenRowItemComponent } from '@matbia/matbia-list-row-item/token-row-item/token-row-item.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    SearchInputComponent,
    TokenRowItemComponent,
    TokensPdfComponent,
    MatbiaSkeletonLoaderComponentComponent,
  ],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class ListViewComponent implements OnInit, OnDestroy {
  selectedRows: TokenObj[] = [];
  isLoading: boolean = false;

  rows$!: Observable<Array<TokenObj>>;
  total$!: Observable<number>;

  totals: number = 0;
  totalTokens: number = 0;
  generated: number = 0;
  processed: number = 0;
  totalGenerated: number = 0;
  totalProcessed: number = 0;

  reason: string = '';

  pdfSrc: string | ArrayBuffer | undefined;
  modalOptions?: NgbModalOptions;
  listData: Array<TokenObj> = [];

  tokens: Array<TokensObj> = [];

  isActions: boolean = false;
  selectedTokens: number = 0;
  totalAmount: number = 0;
  tokenIds: number[] = [];
  generatingPDF: boolean = false;

  @ViewChildren(SortableHeaderDirective)
  headers!: QueryList<SortableHeaderDirective>;

  @ViewChild(TokensPdfComponent) tokenPdfCom!: TokensPdfComponent;

  hasNonGeneratedStatus: boolean = false;
  filterOptionsList: filterData[] = [
    { id: 'All', label: 'All', isChecked: true },
    { id: 'Generated', label: 'Generated', isChecked: false },
    { id: 'Processed', label: 'Processed', isChecked: false },
    { id: 'Expired', label: 'Expired', isChecked: false },
    { id: 'Voided', label: 'Voided', isChecked: false },
    { id: 'Reviewing Cancelation', label: 'Reviewing Cancelation', isChecked: false },
  ];

  selectedOptions: string[] = [];
  isSelectMultiple: boolean = false;
  tokensList: TokenObj[] = [];
  todisplayNoTokenPage: boolean = false;

  constructor(
    protected title: Title,
    private matbiaObserverService: MatbiaObserverService,
    private panelPopup: PanelPopupsService,
    private pageRoute: PageRouteVariable,
    private router: Router,
    private donorTokenAPI: DonorTokenAPIService,
    private localStorageData: LocalStorageDataService,
    private notification: NotificationService,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<TokenObj>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Token list');
    this.headerInit();
    this.rows$ = this.gridService.rows$ as Observable<TokenObj[]>;
    this.total$ = this.gridService.total$;
    this.getTokenData();
  }

  headerInit() {
    this.gridService.TableHeaders = [
      {
        colName: 'Amount',
        sortName: 'amount',
      },
      {
        colName: 'Expiry Date',
        sortName: 'expDate',
      },
      {
        colName: 'Generated Date And Time',
        sortName: 'generatedDateTime',
      },
      {
        colName: 'Status',
        sortName: 'status',
      },
      {
        colName: 'Token Id',
        sortName: 'tokenId',
      },
      {
        colName: 'Token Number',
        sortName: 'tokenNum',
      },
    ];
  }

  getTokenData() {
    this.isLoading = true;
    this.donorTokenAPI
      .getTokens({
        userHandle: this.localStorageData.getLoginUserUserName(),
        fromDate: '',
        toDate: '',
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res) {
            this.gridService.ListData = res.tokens || [];
            if (res.tokens == null) {
              this.todisplayNoTokenPage = true;
              return;
            }
            this.tokensList = [...res.tokens];
            this.totals = res.totalAmount;
            this.totalTokens = res.tokens.length;
            this.totalGenerated = res.tokens.filter((x) => x.status === 'Generated').length;
            this.totalProcessed = res.tokens.filter((x) => x.status === 'Processed').length;
            this.generated = res.totalGenerated;
            this.processed = res.totalProcessed;
          }
        },
        (err) => {
          this.isLoading = false;
          this.gridService.ListData = [];
          this.notification.throwError(err.error);
        }
      );
  }

  ngOnDestroy(): void {
    this.gridService.ListData = [];
  }

  print() {
    this.tokenPdfCom.print();
  }

  generateBarcode(id: string, tokenNum: number, amt: number) {
    JsBarcode(id, `${tokenNum}-${amt}`, { format: 'code39', displayValue: false });
  }

  openTokensPDF() {
    const modalRef = this.panelPopup.openPDFViewPopup();

    modalRef.componentInstance.title = 'Tokens List';

    modalRef.componentInstance.pdfUrl = this.pdfSrc;
  }

  downloadCsv() {
    this.listData = this.selectedRows.filter((obj: any) => delete obj.bookNum);
    this.gridService.ListData = this.listData || [];
    this.gridService.exportProcess('Token');
    this.gridService.ListData = this.tokensList;
  }

  //check box code started
  onCheckboxChange(row: TokenObj, isChecked: boolean) {
    if (isChecked) {
      this.isActions = isChecked;
      this.selectedRows = [...this.selectedRows, row];

      this.calculateSelectedTokens(this.selectedRows);
    } else {
      const index = this.selectedRows.findIndex((item) => item === row);
      if (index !== -1) {
        this.selectedRows.splice(index, 1);
        this.calculateSelectedTokens(this.selectedRows);
      }

      if (index == 0) {
        this.isActions = false;
      }
    }

    this.hasNonGeneratedStatus = this.selectedRows.some((row) => row.status !== TokenStatus.GENERATED);
  }

  calculateSelectedTokens(selectedRows: TokenObj[]) {
    this.selectedTokens = selectedRows.length;
    this.totalAmount = selectedRows.reduce((acc, row) => acc + row.amount, 0);
    this.tokenIds = selectedRows.map((row) => row.tokenId).filter((tokenId) => tokenId);
  }
  //checkbox code ended

  cancelModal() {
    const modalRef = this.panelPopup.openCancelTokenPopup();
    modalRef.componentInstance.tokenIds = this.tokenIds;
    modalRef.componentInstance.totalAmount = this.totalAmount;
    modalRef.componentInstance.refresh.subscribe((val: boolean) => {
      if (val) {
        this.refresh();
      }
    });
  }

  cancelSelection() {
    this.matbiaObserverService._isUnSelectedRows$.next(true);
    this.isSelectMultiple = false;
  }

  isRedeemedContainsInSelectedItems(): boolean {
    let Redeemed = this.selectedRows.filter((x) => x.status == 'Redeemed');
    return Redeemed.length > 0;
  }

  //filter dropdown functionality started
  onSelectStatus(data: filterData) {
    if (data && data.isChecked) {
      this.selectedOptions.push(data.id);

      if (data.id === 'All') {
        this.gridService.queryFilter = { status: [] };
        return;
      }

      let allFilter = this.filterOptionsList.find((filter) => filter.id == 'All' && filter.isChecked);
      if (allFilter) allFilter.isChecked = false;

      this.gridService.queryFilter = { status: this.selectedOptions };
      return;
    }

    if (data && !data.isChecked) {
      const index = this.selectedOptions.findIndex((item) => item === data.id);
      if (index !== -1) {
        this.selectedOptions.splice(index, 1);
      }

      if ((data.id === 'All' && data.isChecked) || this.selectedOptions.includes('All')) {
        this.gridService.queryFilter = { status: [] };
        return;
      }

      this.gridService.queryFilter = { status: this.selectedOptions };
      return;
    }

    this.gridService.queryFilter = { status: [] };
  }
  //filter dropdown functionality ended

  getGenerateTokensRouterLink() {
    return this.pageRoute.getGenerateTokensRouterLink();
  }

  onSearch(value: string) {
    this.gridService.searchTerm = value;
  }

  selectMultiple() {
    if (this.isSelectMultiple == true) {
      this.matbiaObserverService._isUnSelectedRows$.next(true);
    }
    this.isSelectMultiple = !this.isSelectMultiple;
  }

  refresh() {
    this.getTokenData();
  }

  getCustomStyle(index: number): string {
    if (index % 9 === 6) {
      return 'border-bottom-color: transparent;'; // Style for seventh child
    } else if (index % 9 === 7) {
      return 'border-bottom-color: transparent;'; // Style for eighth child
    } else if (index % 9 === 8) {
      return 'border-bottom-color: transparent;'; // Style for ninth child
    } else {
      return ''; // No style for other children
    }
  }
}
