import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { groupBy, min, sumBy, map as _map } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  DonationRequestObj,
  DonorTransactionObj,
  GetDonorTransactionPayload,
  ScheduleObj,
} from 'src/app/models/panels';

export interface DonorTransactionResponse {
  transactions: Array<DonorTransactionObj>;
  tokens: Array<DonorTransactionObj>;
  donationRequests: Array<DonationRequestObj>;
  schedules: Array<ScheduleObj>;
  organizationDonations: Array<{ orgName: string; donation: number }>;
  availableBalance: number;
  presentBalance: number;
  totalDeposits: number;
  depositPercentage: number;
  totalDonations: number;
  donationPercentage: number;
  isBankAccountLinked: boolean;
  isCardSettingsSaved: boolean;
  requestsCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DonorDashboardService {
  private version = 'v1/';
  private DONOR_DASHBOARD_URL = `${this.version}DonorDashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(formdata: GetDonorTransactionPayload): Observable<DonorTransactionResponse> {
    return this.http.post<DonorTransactionResponse>(this.DONOR_DASHBOARD_URL, formdata).pipe(
      map((res) => {
        if (res.transactions && res.transactions.length !== 0) {
          const list = res.transactions.map((t) => {
            return {
              ...t,
              method: t.method === 'Wallet Transfer' ? 'Portal Donation' : t.method,
            };
          });

          const tokens = list.filter((i) => {
            return !!i.bookNumber;
          });

          const transactions = list.filter((i) => {
            return !i.bookNumber;
          });

          return {
            ...res,
            transactions: transactions,
            tokens: tokens.map((o) => {
              return {
                ...o,
              };
            }),
          };
        }

        return {
          ...res,
          transactions: [],
          tokens: [],
        };
      }),
      map((res) => {
        if (res.tokens && res.tokens.length !== 0) {
          const tokensArray = [];

          const groupedValue = groupBy(res.tokens, 'bookNumber');

          for (const key in groupedValue) {
            if (Object.prototype.hasOwnProperty.call(groupedValue, key)) {
              const tokenBookList: Array<DonorTransactionObj> = groupedValue[key];

              if (tokenBookList.length !== 0) {
                const firstToken = tokenBookList[0];

                const groupedTokenBook = _map(groupBy(tokenBookList, 'balance'), (objs: any, key: any) => ({
                  status: key,
                  count: objs.length,
                  amount: sumBy(objs, 'amount'),
                }));

                const totalSum = sumBy(groupedTokenBook, 'amount');
                const totalCount = tokenBookList.length;

                const tokenbalance: Array<number> = _map(tokenBookList, (o: DonorTransactionObj) => o.balance);

                const totalBalance = min(tokenbalance);

                const tokenBookDetails = {
                  totalAmount: totalSum,
                  totalCount: totalCount,
                  balance: totalBalance,
                  tokenBookList: tokenBookList,
                  processCount: totalCount,
                };
                const multiply =
                  firstToken.amount === 18 || firstToken.amount === 36 || firstToken.amount === 50 ? 25 : 50;

                tokensArray.push({
                  ...firstToken,
                  tokenBookDetails,
                  amount: firstToken.transStatus != 'Success' ? firstToken.amount * multiply : firstToken.amount,
                });
              }
            }
          }

          return {
            ...res,
            tokens: res.tokens,
          };
        }

        return {
          ...res,
          tokens: [],
        };
      })
    );
  }
}
