import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';

import { PopupsModule } from '../popups/popups.module';
import { AutoDepositRoutingModule } from './auto-deposit-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AutoDepositRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    PopupsModule,
    NgbModule,
    NgSelectModule,
    MatbiaPipesModule,
    MatbiaInputModule,
    MatbiaFormGroupModule,
    MatbiaDirectiveModule,
    MatbiaDataGridModule,
    MatbiaSkeletonLoaderModule,
  ],
  // entryComponents: [RecurringDepositPopupComponent],

  providers: [provideNgxMask()],
})
export class AutoDepositModule {}
