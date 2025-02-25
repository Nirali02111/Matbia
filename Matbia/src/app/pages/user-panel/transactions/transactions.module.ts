import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TransactionsRoutingModule } from './transactions-routing.module';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaPanelSharedModule } from '@matbia/matbia-panel-shared/matbia-panel-shared.module';

import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot(),

    NgbModule,
    NgSelectModule,
    TransactionsRoutingModule,
    MatbiaListRowItemModule,
    MatbiaPanelSharedModule,

    MatbiaDirectiveModule,
    MatbiaDataGridModule,
    MatbiaSkeletonLoaderModule,
    SearchPipe,
  ],
  providers: [],
})
export class TransactionsModule {}
