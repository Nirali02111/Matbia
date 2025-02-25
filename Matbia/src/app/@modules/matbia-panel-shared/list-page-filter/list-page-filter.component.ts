import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonDataService } from '@commons/common-data-service.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { SearchInputComponent } from '@matbia/matbia-input/search-input/search-input.component';

import { SharedModule } from '@matbia/shared/shared.module';
import { DatePickerFilterComponent } from '../date-picker-filter/date-picker-filter.component';

@Component({
  selector: 'app-list-page-filter',
  templateUrl: './list-page-filter.component.html',
  styleUrls: ['./list-page-filter.component.scss'],
  imports: [SharedModule, SearchInputComponent, DatePickerFilterComponent],
})
export class ListPageFilterComponent implements OnInit {
  closeOnSelect: boolean = false;
  selectedTypes = 'All';
  selectedStatus: number = 1;

  selectedStatusLabel: string = 'All';

  statusArray: any[] = [
    { id: 1, label: 'All' },
    { id: 2, label: 'Pending' },
    { id: 3, label: 'FulFilled' },
    { id: 4, label: 'Snoozed' },
  ];

  statusOpen = false;
  isFilterDropdownOpen: boolean = false;

  @Input() showMenu = true;

  @Input() isDatePickerFilter = true;

  @Input() batchNum!: any;

  @Input() isRequest: boolean = false;

  @Output() filtered = new EventEmitter();

  @Output() search = new EventEmitter();

  @Output() exportToExcel = new EventEmitter();

  @Output() selectedstatus = new EventEmitter();

  @Output() selectedType = new EventEmitter();

  @Output() toggleClass = new EventEmitter();
  isTypeStatusFilterOpen: boolean = false;

  constructor(
    private router: Router,
    private pageRoute: PageRouteVariable,
    public commonDataService: CommonDataService,
    public gridService: MatbiaDataGridService<any>
  ) {}

  ngOnInit(): void {}

  applyFilter(value: string) {
    this.search.emit(value);
  }

  filterChange(event: any) {
    this.filtered.emit(event);
  }

  onSelectStatus(data: { id: number; label: string }) {
    this.selectedStatusLabel = data.label;
    this.selectedstatus.emit(data);
  }

  statusClass(status: any) {
    if (status == 'All') {
      return '';
    }
    if (status === 'Pending') {
      return 'open-badge';
    }
    if (status === 'FulFilled') {
      return 'sent-badge';
    }
    if (status === 'Snoozed') {
      return 'dismissed-badge';
    }
    return '';
  }

  onExport(event: any) {
    event.preventDefault();
    this.exportToExcel.emit(true);
  }

  openStatus() {
    if (this.statusOpen == false) {
      this.statusOpen = true;
    } else {
      this.statusOpen = false;
    }
  }

  onRemoveBatch() {
    this.router.navigate(this.pageRoute.getTransactionsRouterLink());
  }

  onSelectTypes(data: { id: string; label: string }) {
    this.selectedType.emit(data);
  }

  /** logic to add/remove class based on any filter dropdown is opened or closed */
  onToggleFilterDropDown(isOpen: boolean, fromDatePicker = false) {
    if (!fromDatePicker) {
      this.isTypeStatusFilterOpen = isOpen;
    }

    if (this.isTypeStatusFilterOpen && fromDatePicker && !isOpen) return;
    this.isFilterDropdownOpen = isOpen;
  }
}
