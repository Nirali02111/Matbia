import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';

import { AddFundsRoutingModule } from './add-funds-routing.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { AddFundsOtherMethodOptionLinksComponent } from './add-funds-other-method-option-links/add-funds-other-method-option-links.component';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { NgxMaskDirective } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    // AddFundsOtherMethodOptionLinksComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,

    AddFundsRoutingModule,

    MatbiaDirectiveModule,
    MatbiaFormGroupModule,
    MatbiaLoaderButtonModule,
    MatbiaSkeletonLoaderModule,
    MatbiaInputModule,
    NgxMaskDirective,
    NgSelectModule,
  ],
})
export class AddFundsModule {}
