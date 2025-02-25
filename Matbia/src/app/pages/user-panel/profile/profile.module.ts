import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';

import { ProfileRoutingModule } from './profile-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { BusinessAPIService } from '@services/API/business-api.service';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatbiaInputModule,
    MatbiaFormGroupModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgSelectModule,
    MatbiaDirectiveModule,
    MatbiaLoaderButtonModule,
  ],
  providers: [BusinessAPIService, provideNgxMask()],
})
export class ProfileModule {}
