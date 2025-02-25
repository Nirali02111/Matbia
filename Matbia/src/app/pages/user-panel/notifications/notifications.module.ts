import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { NotificationsRoutingModule } from './notifications-routing.module';

import { MatbiaAlertSettingModule } from '@matbia/matbia-alert-setting/matbia-alert-setting.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgbModule,

    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    NotificationsRoutingModule,
    MatbiaAlertSettingModule,
    MatbiaPipesModule,
    MatbiaLoaderButtonModule,
    MatbiaInputModule,
    MatbiaSkeletonLoaderModule,
  ],

  providers: [provideNgxMask()],
})
export class NotificationsModule {}
