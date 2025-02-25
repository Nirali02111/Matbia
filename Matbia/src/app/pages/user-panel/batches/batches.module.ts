import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaPanelSharedModule } from '@matbia/matbia-panel-shared/matbia-panel-shared.module';
import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';

import { BatchesRoutingModule } from './batches-routing.module';
import { PopupsModule } from '../popups/popups.module';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    BatchesRoutingModule,
    PopupsModule,
    MatbiaPanelSharedModule,
    MatbiaListRowItemModule,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaDataGridModule,
    MatbiaSkeletonLoaderModule,
    NgbPaginationModule,
  ],

  providers: [provideNgxMask()],
})
export class BatchesModule {}
