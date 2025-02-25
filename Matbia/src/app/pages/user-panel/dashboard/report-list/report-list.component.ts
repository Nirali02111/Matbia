import { Component, OnInit } from '@angular/core';
import { MatbiaQueryReportListComponent } from '@matbia/matbia-query-report/matbia-query-report-list/matbia-query-report-list.component';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  imports: [SharedModule, MatbiaQueryReportListComponent],
})
export class ReportListComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
