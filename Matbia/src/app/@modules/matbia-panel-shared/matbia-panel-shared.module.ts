import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import moment from 'moment';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { NgbDatepicker, NgbDropdownModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot({
      monthNames: moment.months(),
    }),
    MatbiaInputModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbDatepicker,
    NgbDatepickerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
  ],
  exports: [],
})
export class MatbiaPanelSharedModule {}
