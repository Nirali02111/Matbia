import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IConfig, NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgOtpInputModule } from 'ng-otp-input';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaTermsOfServiceModule } from '@matbia/matbia-terms-of-service/matbia-terms-of-service.module';

import { MatbiaFormGroupService } from './matbia-form-group.service';

import { MatbiaUSPSModule } from '@matbia/matbia-usps/matbia-usps.module';

import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaLoaderButtonModule,
    MatbiaTermsOfServiceModule,
    MatbiaUSPSModule,
    NgOtpInputModule,
    MatbiaPipesModule,
  ],
  exports: [],
  providers: [MatbiaFormGroupService, provideNgxMask()],
})
export class MatbiaFormGroupModule {}
