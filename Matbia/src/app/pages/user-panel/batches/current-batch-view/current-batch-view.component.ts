import { Component, OnInit } from '@angular/core';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import moment from 'moment';

import { SharedModule } from '@matbia/shared/shared.module';
import { CurrentBatchRowItemComponent } from '@matbia/matbia-list-row-item/current-batch-row-item/current-batch-row-item.component';
import { DatePickerFilterComponent } from '@matbia/matbia-panel-shared/date-picker-filter/date-picker-filter.component';

@Component({
  selector: 'app-current-batch-view',
  templateUrl: './current-batch-view.component.html',
  imports: [SharedModule, CurrentBatchRowItemComponent, DatePickerFilterComponent],
})
export class CurrentBatchViewComponent implements OnInit {
  dummyData = [
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
    {
      id: 4,
    },
    {
      id: 5,
    },
  ];

  selectedDates: { fromDate: any; toDate: any } = {
    fromDate: moment(new Date()).subtract(29, 'days').format('YYYY-MM-DD'),
    toDate: moment(new Date()).format('YYYY-MM-DD'),
  };

  constructor(public panelPopupService: PanelPopupsService) {}

  ngOnInit(): void {}

  filterChange(event: any) {
    this.selectedDates = event;
  }

  openCloseCurrentBatchPopup() {
    this.panelPopupService.openCloseCurrentBatchPopup();
  }
}
