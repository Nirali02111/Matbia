import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';

import { WithdrawFundsRoutingModule } from './withdraw-funds-routing.module';
import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    WithdrawFundsRoutingModule,

    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaPipesModule,
    MatbiaFormGroupModule,
  ],

  providers: [provideNgxMask()],
})
export class WithdrawFundsModule {}
