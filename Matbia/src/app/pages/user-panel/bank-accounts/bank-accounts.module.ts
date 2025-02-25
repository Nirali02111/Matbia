import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { PlaidLinkButtonModule } from '@matbia/plaid-link-button/plaid-link-button.module';
import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';

import { BankAccountsRoutingModule } from './bank-accounts-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BankAccountsRoutingModule,
    MatbiaFormGroupModule,
    MatbiaInputModule,
    MatbiaListRowItemModule,
    PlaidLinkButtonModule,
    NgbModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    MatbiaLoaderButtonModule,
    MatbiaDirectiveModule,
    MatbiaSkeletonLoaderModule,
  ],

  providers: [provideNgxMask()],
})
export class BankAccountsModule {}
