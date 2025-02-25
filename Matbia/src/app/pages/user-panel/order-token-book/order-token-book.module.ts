import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';

import { OrderTokenBookRoutingModule } from './order-token-book-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OrderTokenBookRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatbiaFormGroupModule,
    MatbiaLoaderButtonModule,
  ],
})
export class OrderTokenBookModule {}
