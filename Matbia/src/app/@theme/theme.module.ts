import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ThemeService } from './theme.service';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbModule,
    MatbiaDirectiveModule,
    MatbiaInputModule,
    MatIconModule,
  ],
  providers: [ThemeService, provideHttpClient(withInterceptorsFromDi())],
})
export class ThemeModule {}
