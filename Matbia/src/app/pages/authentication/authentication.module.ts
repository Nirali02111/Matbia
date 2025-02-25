import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, RECAPTCHA_LOADER_OPTIONS } from 'ng-recaptcha';
import { NgOtpInputModule } from 'ng-otp-input';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { BROWSER_GLOBALS_PROVIDERS, MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaLoaderButtonModule } from '@matbia/matbia-loader-button/matbia-loader-button.module';
import { MatbiaSharedPopupModule } from '@matbia/matbia-shared-popup/matbia-shared-popup.module';
import { GoogleAuthService } from '@services/google-auth.service';

import { LandingModuleService } from '../landing/landing-module.service';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { environment } from './../../../environments/environment';
import { LandingModule } from '../landing/landing.module';

// export const service = new PreloadedRecaptchaAPIService();

@NgModule({
  declarations: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AuthenticationRoutingModule,
    MatbiaInputModule,
    NgOtpInputModule,
    MatbiaDirectiveModule,
    MatbiaLoaderButtonModule,
    MatbiaSharedPopupModule,
    LandingModule,
  ],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.RECAPTCHA_V3_SITE_KEY },
    {
      provide: RECAPTCHA_LOADER_OPTIONS,
      useValue: {
        onBeforeLoad(_url: any) {
          return {
            url: new URL('https://www.google.com/recaptcha/enterprise.js'),
          };
        },
        onLoaded(recaptcha: any) {
          return recaptcha.enterprise;
        },
      },
    },
    LandingModuleService,
    ...BROWSER_GLOBALS_PROVIDERS,
    GoogleAuthService,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AuthenticationModule {}
