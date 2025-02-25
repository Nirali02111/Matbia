import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaPanelSharedModule } from '@matbia/matbia-panel-shared/matbia-panel-shared.module';
import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';

import { RequestsRoutingModule } from './requests-routing.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { NgxMaskDirective } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RequestsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    MatbiaFormGroupModule,
    MatbiaPanelSharedModule,
    MatbiaListRowItemModule,
    MatbiaDirectiveModule,
    MatbiaDataGridModule,
    MatbiaSkeletonLoaderModule,
    MatbiaInputModule,
    NgxMaskDirective,
  ],
  providers: [],
})
export class RequestsModule {}
