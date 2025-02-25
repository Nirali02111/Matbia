import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { PlaidLinkButtonModule } from '@matbia/plaid-link-button/plaid-link-button.module';

import { PopupsModule } from 'src/app/pages/user-panel/popups/popups.module';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatbiaDirectiveModule,
    PlaidLinkButtonModule,
    PopupsModule,
    NgbModule,
    MatbiaInputModule,
  ],
  exports: [],
})
export class MatbiaListRowItemModule {}
