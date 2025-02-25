import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';

import { AccountsRoutingModule } from './accounts-routing.module';
import { PopupsModule } from '../popups/popups.module';
import { BusinessAPIService } from '@services/API/business-api.service';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopupsModule,
    AccountsRoutingModule,
    NgbModule,
    MatbiaFormGroupModule,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaLoaderButtonModule,
  ],

  providers: [BusinessAPIService],
})
export class AccountsModule {}
