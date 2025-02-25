import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaSharedPopupModule } from '@matbia/matbia-shared-popup/matbia-shared-popup.module';
import { MatbiaTermsOfServiceModule } from '@matbia/matbia-terms-of-service/matbia-terms-of-service.module';

import { PanelPopupsService } from './panel-popups.service';
import { MatbiaUSPSModule } from '@matbia/matbia-usps/matbia-usps.module';

import { MatbiaPanelSharedModule } from '@matbia/matbia-panel-shared/matbia-panel-shared.module';

import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatbiaFormGroupModule,
    MatbiaSharedPopupModule,
    MatbiaDirectiveModule,
    MatbiaInputModule,
    MatbiaLoaderButtonModule,
    MatbiaTermsOfServiceModule,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxDaterangepickerMd.forRoot(),
    MatbiaUSPSModule,
    NgxMaterialTimepickerModule,
    MatbiaPanelSharedModule,
    MatbiaSkeletonLoaderModule,
    NgbTooltipModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [PanelPopupsService, provideNgxMask()],
})
export class PopupsModule {}
