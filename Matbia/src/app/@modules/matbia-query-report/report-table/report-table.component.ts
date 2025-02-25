import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/@theme/theme.service';
import { RepostItemObj } from '../API/dynamic-grid-report.service';
import { NgbdSortableHeaderDirective, SortEvent } from '../directive/ngbd-sortable-header.directive';
import { MatbiaQueryReportService } from '../matbia-query-report.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { SortableHeaderDirective } from '@matbia/matbia-directive/sortable-header.directive';

@Component({
  selector: 'app-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss'],
  imports: [SharedModule, SortableHeaderDirective],
})
export class ReportTableComponent implements OnInit, OnDestroy {
  @ViewChildren(NgbdSortableHeaderDirective) headers!: QueryList<NgbdSortableHeaderDirective>;

  private _matbiaSearchSubscriptions: Subscription = new Subscription();

  initialize$!: Observable<boolean>;
  tableHeaders$!: Observable<Array<string>>;
  rows$!: Observable<Array<RepostItemObj>>;
  total$!: Observable<number>;

  constructor(private themeService: ThemeService, public reportFilter: MatbiaQueryReportService) {}

  ngOnInit(): void {
    this.applySearchInTransactionList();

    this.initialize$ = this.reportFilter.initialize$;
    this.tableHeaders$ = this.reportFilter.headers$;
    this.rows$ = this.reportFilter.rows$;
    this.total$ = this.reportFilter.total$;
  }

  ngOnDestroy(): void {
    this._matbiaSearchSubscriptions.unsubscribe();
  }

  applySearchInTransactionList() {
    this._matbiaSearchSubscriptions = this.themeService.searchInMatbiaObservable.subscribe((val) => {
      this.reportFilter.searchTerm = val;
    });
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.reportFilter.sortColumn = column;
    this.reportFilter.sortDirection = direction;
  }
}
