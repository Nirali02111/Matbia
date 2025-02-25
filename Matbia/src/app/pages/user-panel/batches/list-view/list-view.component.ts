import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { SortableHeaderDirective } from '@matbia/matbia-directive/sortable-header.directive';
import { BatchAPIService, BatchDetailObj } from '@services/API/batch-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ListPageFilterComponent } from '@matbia/matbia-panel-shared/list-page-filter/list-page-filter.component';
import { BatchRowItemComponent } from '@matbia/matbia-list-row-item/batch-row-item/batch-row-item.component';
import { DatePickerFilterComponent } from '@matbia/matbia-panel-shared/date-picker-filter/date-picker-filter.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
  imports: [
    SharedModule,
    ListPageFilterComponent,
    BatchRowItemComponent,
    DatePickerFilterComponent,
    MatbiaSkeletonLoaderComponentComponent,
  ],
})
export class ListViewComponent implements OnInit {
  availableBalance = 0;
  pastDonations = 0;
  presentBalance = 0;
  totalDonations = 0;

  isLoading = false;

  selectedDates: { fromDate: any; toDate: any } = {
    fromDate: '',
    toDate: '',
  };

  rows$!: Observable<Array<BatchDetailObj>>;
  total$!: Observable<number>;

  @ViewChildren(SortableHeaderDirective)
  headers!: QueryList<SortableHeaderDirective>;

  constructor(
    protected title: Title,

    private router: Router,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<BatchDetailObj>,
    private batchAPI: BatchAPIService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Batches');

    this.rows$ = this.gridService.rows$ as Observable<BatchDetailObj[]>;
    this.total$ = this.gridService.total$;

    this.gridService.TableHeaders = [
      {
        colName: 'Date & Time',
        sortName: 'createdDate',
      },
      {
        colName: 'Batch Id#',
        sortName: 'batchNum',
      },
      {
        colName: 'Type',
        sortName: 'type',
      },
      {
        colName: 'Status',
        sortName: 'transStatus',
      },
      {
        colName: 'To/From',
        sortName: 'toBank',
      },
      {
        colName: 'Total',
        sortName: 'totalAmount',
      },
    ];

    this.gridService.setCurrencyColumns(['Total']);
    this.getDetails();
  }

  private getDetails() {
    this.isLoading = true;
    this.batchAPI.getBatchDetails({ ...this.selectedDates }).subscribe(
      (res) => {
        this.isLoading = false;

        this.availableBalance = res.availableBalance || 0;
        this.pastDonations = res.pastDonations || 0;
        this.presentBalance = res.presentBalance || 0;
        this.totalDonations = res.totalDonations || 0;

        this.gridService.ListData = res.batchDetailList || [];
      },
      () => {
        this.isLoading = false;
        this.gridService.ListData = [];
      }
    );
  }

  filterChange(event: any) {
    this.selectedDates = event;
    this.getDetails();
  }

  onSearch(value: string) {
    this.gridService.searchTerm = value;
  }

  onExportTransactionData() {
    this.gridService.exportProcess('Batches');
  }
}
