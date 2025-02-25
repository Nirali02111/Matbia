import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaFormGroupModule } from '@matbia/matbia-form-group/matbia-form-group.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';

import { DonateSearchResolver, DonateRoutingModule } from './donate-routing.module';
import { DonateObserverService } from './donate-observer.service';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DonateRoutingModule,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaFormGroupModule,

    MatbiaSkeletonLoaderModule,
    SearchPipe,
  ],
  providers: [DonateObserverService, DonateSearchResolver],
})
export class DonateModule {}
