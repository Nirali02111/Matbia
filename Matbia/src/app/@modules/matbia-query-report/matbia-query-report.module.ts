import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatbiaQueryReportService } from './matbia-query-report.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicGridReportService } from './API/dynamic-grid-report.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from '@commons/api-interceptor';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import moment from 'moment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgSelectModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxDaterangepickerMd.forRoot({
      monthNames: moment.months(),
    }),

    SearchPipe,
  ],

  exports: [],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },

    MatbiaQueryReportService,
    DynamicGridReportService,

    provideNgxMask(),
  ],
})
export class MatbiaQueryReportModule {}
