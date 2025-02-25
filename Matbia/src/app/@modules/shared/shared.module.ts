import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionsModule } from 'src/app/pages/user-panel/transactions/transactions.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';
import { RouterModule } from '@angular/router';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';

import { HebrewCalenderDatePipe } from '@matbia/matbia-pipes/hebrew-calender-date.pipe';
import {
  AllowCopyDirective,
  BlockCutCopyPasteDirective,
} from '@matbia/matbia-directive/block-cut-copy-paste.directive';
import { MatCalendar } from '@angular/material/datepicker';
import { NgOtpInputModule } from 'ng-otp-input';
import { PersonalAccessControlDirective } from '@matbia/matbia-directive/access-control/personal-access-control.directive';
import { OrganizationAccessControlDirective } from '@matbia/matbia-directive/access-control/organization-access-control.directive';
import { BusinessAccessControlDirective } from '@matbia/matbia-directive/access-control/business-access-control.directive';
import { BusinessDonorAccessControlDirective } from '@matbia/matbia-directive/access-control/business-donor-access-control.directive';
import { ReportAccessControlDirective } from '@matbia/matbia-directive/access-control/report-access-control.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TransactionsModule,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaPipesModule,
    RouterModule,
    CurrencyPipe,
    SearchPipe,
    NgbModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    MatbiaLoaderButtonModule,
    NgxDaterangepickerMd,
    HebrewCalenderDatePipe,
    BlockCutCopyPasteDirective,
    AllowCopyDirective,
    MatCalendar,
    NgOtpInputModule,
    PersonalAccessControlDirective,
    OrganizationAccessControlDirective,
    BusinessAccessControlDirective,
    BusinessDonorAccessControlDirective,
    ReportAccessControlDirective,
  ],
  exports: [
    RouterModule,
    CurrencyPipe,
    CommonModule,
    SearchPipe,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatbiaLoaderButtonModule,
    NgxDaterangepickerMd,
    HebrewCalenderDatePipe,
    BlockCutCopyPasteDirective,
    AllowCopyDirective,
    MatCalendar,
    NgOtpInputModule,
    PersonalAccessControlDirective,
    OrganizationAccessControlDirective,
    BusinessAccessControlDirective,
    BusinessDonorAccessControlDirective,
    ReportAccessControlDirective,
  ],
})
export class SharedModule {}
