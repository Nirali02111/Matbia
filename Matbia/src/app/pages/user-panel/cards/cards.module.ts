import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';

import { CardsRoutingModule } from './cards-routing.module';
import { MatbiaPipesModule } from '@matbia/matbia-pipes/matbia-pipes.module';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CardsRoutingModule,
    MatbiaFormGroupModule,
    FormsModule,
    NgxMaskPipe,
    ReactiveFormsModule,
    MatbiaInputModule,
    MatbiaLoaderButtonModule,
    MatbiaSkeletonLoaderModule,
    MatbiaPipesModule,
    NgbTooltipModule
  ],

  providers: [provideNgxMask()],
})
export class CardsModule { }
