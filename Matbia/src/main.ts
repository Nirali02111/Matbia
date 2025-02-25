import { enableProdMode, importProvidersFrom } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UrlHandlingStrategy } from '@angular/router';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaUrlHandlingStrategy } from '@commons/matbia-url-handling-strategy';
import { ApiInterceptor } from '@commons/api-interceptor';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { ThemeModule } from './app/@theme/theme.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FormsModule, NgbModule, ToastrModule.forRoot(), ThemeModule, AppRoutingModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    { provide: UrlHandlingStrategy, useClass: MatbiaUrlHandlingStrategy },

    DatePipe,
    provideAnimations(), provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
