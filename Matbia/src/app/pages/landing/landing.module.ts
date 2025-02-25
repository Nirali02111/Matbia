import { NgModule } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';

import { MatbiaUSPSModule } from '@matbia/matbia-usps/matbia-usps.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { PlaidLinkButtonModule } from '@matbia/plaid-link-button/plaid-link-button.module';
import { MatbiaSharedPopupModule } from '@matbia/matbia-shared-popup/matbia-shared-popup.module';
import { MatbiaTermsOfServiceModule } from '@matbia/matbia-terms-of-service/matbia-terms-of-service.module';
import { MatbiaAlertSettingModule } from '@matbia/matbia-alert-setting/matbia-alert-setting.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';

import { LandingRoutingModule } from './landing-routing.module';

import { LandingModuleService } from './landing-module.service';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { EmailMaskPipe } from '@matbia/matbia-pipes/email-mask.pipe';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    LandingRoutingModule,
    MatbiaFormGroupModule,
    PlaidLinkButtonModule,
    MatbiaSharedPopupModule,
    MatbiaTermsOfServiceModule,
    MatbiaUSPSModule,
    MatbiaSkeletonLoaderModule,
    MatbiaAlertSettingModule,
    EmailMaskPipe,
  ],
  providers: [
    LandingModuleService,
    provideNgxMask(),
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.RECAPTCHA_V3_SITE_KEY },
  ],
})
export class LandingModule {}
