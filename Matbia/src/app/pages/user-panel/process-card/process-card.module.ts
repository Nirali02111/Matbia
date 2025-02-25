import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';

import { ProcessCardRoutingModule } from './process-card-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProcessCardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    MatbiaPipesModule,
    MatbiaInputModule,
    MatbiaLoaderButtonModule,
    MatbiaFormGroupModule,
  ],
})
export class ProcessCardModule {}
