import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaPanelSharedModule } from '@matbia/matbia-panel-shared/matbia-panel-shared.module';
import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';

import { SchedulesRoutingModule } from './schedules-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SchedulesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,
    MatbiaPanelSharedModule,
    MatbiaListRowItemModule,
    MatbiaDirectiveModule,
    MatbiaDataGridModule,
    MatbiaSkeletonLoaderModule,
  ],
  providers: [],
})
export class SchedulesModule {}
