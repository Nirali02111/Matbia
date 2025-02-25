import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaTermsOfServiceModule } from '@matbia/matbia-terms-of-service/matbia-terms-of-service.module';

import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbAlertModule,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaLoaderButtonModule,
    MatbiaFormGroupModule,
    MatbiaTermsOfServiceModule,
    MatbiaPipesModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  exports: [],
})
export class MatbiaSharedPopupModule {}
