import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import moment from 'moment';

import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { CSAgentAPIService, RecentAgentLogin } from '@services/API/csagent-api.service';
import { UserTypes } from '@enum/UserTypes';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-cslog-portal',
  templateUrl: './cslog-portal.component.html',
  styleUrls: ['./cslog-portal.component.scss'],
  imports: [SharedModule],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class CSLogPortalComponent implements OnInit {
  rows$!: Observable<Array<RecentAgentLogin>>;
  total$!: Observable<number>;

  initialize = false;

  constructor(
    private router: Router,
    private notification: NotificationService,

    private localStorageData: LocalStorageDataService,
    private csAgentAPI: CSAgentAPIService,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<RecentAgentLogin>
  ) {}

  ngOnInit(): void {
    this.rows$ = this.gridService.rows$.pipe(
      map((rows) =>
        rows.map((row) => ({
          ...row,
          actionDate: this.convertUTCToUserTimezone(row.actionDate),
        }))
      )
    );

    this.total$ = this.gridService.total$;

    const username = this.localStorageData.getLoginUserUserName();
    const userFullName = this.localStorageData.getLoginUserFullName();

    const reportUserData = this.localStorageData.getReportData();

    const paramUsername =
      reportUserData && reportUserData.userType === UserTypes.REPORT ? reportUserData.userName : username;

    this.csAgentAPI.getRecentAgentLogin(paramUsername).subscribe(
      (res) => {
        this.initialize = true;
        const resArray = res || [];
        this.gridService.ListData = resArray.map((o) => {
          return {
            ...o,
            name: userFullName,
          };
        });
      },
      () => {
        this.noAccess();
      }
    );
  }

  private noAccess() {
    const modal = this.notification.initLoadingPopup({
      didOpen: () => {},
    });

    modal.then(() => {
      this.router.navigate([`/${PageRouteVariable.DashboardUrl}`]);
    });

    this.notification.throwError('No logs access');
  }

  convertUTCToUserTimezone(utcDt: string): string {
    let utcDate = moment.utc(utcDt).toDate();
    let localDate = moment(utcDate).local().format('YYYY-MM-DD HH:mm:ss');
    return localDate;
  }
}
