import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { NgChartsModule } from 'ng2-charts';
import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaPanelSharedModule } from '@matbia/matbia-panel-shared/matbia-panel-shared.module';
import { MatbiaQueryReportModule } from '@matbia/matbia-query-report/matbia-query-report.module';
import { MatbiaSkeletonLoaderModule } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader.module';
import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';
import { MatbiaQueryReportListComponent } from '@matbia/matbia-query-report/matbia-query-report-list/matbia-query-report-list.component';

import { ThemeModule } from './../../@theme/theme.module';
import { UserPanelRoutingModule } from './user-panel-routing.module';
import { PopupsModule } from './popups/popups.module';

@NgModule({
  declarations: [],
  imports: [
    ThemeModule,
    UserPanelRoutingModule,

    PopupsModule,
    LayoutModule,

    MatbiaListRowItemModule,
    MatbiaPanelSharedModule,

    MatbiaDataGridModule,
    MatbiaQueryReportModule,
    MatbiaSkeletonLoaderModule,
    NgChartsModule,
  ],

  providers: [MatbiaQueryReportListComponent],
})
export class UserPanelModule {}
