import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonorTransactionObj, ScheduleObj } from 'src/app/models/panels';
import moment from 'moment';
import { map } from 'rxjs/operators';

export interface MonthWiseDonationsObj {
  month: string;
  donations: number | null;
}

export interface PeriodWiseDonationsObj {
  period: string;
  donations: number | null;
}

export interface OrganizationDashboardResponse {
  transactions: Array<DonorTransactionObj>;
  schedules: Array<ScheduleObj>;
  monthWiseDonations: Array<MonthWiseDonationsObj>;

  periodWiseDonations: Array<PeriodWiseDonationsObj>;

  availableBalance: number | null;
  presentBalance: number | null;
  totalDonations: number | null;
  donationsGrowthPercentage: number | null;
  pastDonations: number | null;
  fundingBalance: number | null;
}

export interface OrganizationDashboardPayload {
  orgHandle: string;
  fromDate: string | null;
  toDate: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationDashboardAPIService {
  private version = 'v1/';

  private ORGANIZATION_DASHBOARD_URL = `${this.version}OrganizationDashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(formdata: OrganizationDashboardPayload): Observable<OrganizationDashboardResponse> {
    return this.http.post<OrganizationDashboardResponse>(this.ORGANIZATION_DASHBOARD_URL, formdata).pipe(
      map((response) => {
        const sortOrderMap: Record<string, number> = {
          redeemed: 1,
          'matbia fee': 2,
          'check fee': 3,
        };

        // Process and sort transactions
        const sortedTransactions = response.transactions
          .map((transaction) => {
            return {
              ...transaction,
              transDate: moment(transaction.transDate).format('YYYY-MM-DDTHH:mm'),
              sortOrder: sortOrderMap[transaction.transType.toLowerCase()] || 4,
            };
          })
          .sort((a, b) => (a.sortOrder === 4 || b.sortOrder === 4 ? 0 : a.sortOrder - b.sortOrder));

        return {
          ...response,
          transactions: sortedTransactions,
        };
      })
    );
  }
}
