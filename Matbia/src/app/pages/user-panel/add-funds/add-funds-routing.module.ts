import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';

import { ListViewComponent } from './list-view/list-view.component';
import { PaypalCreditDepositFundsComponent } from './paypal-credit-deposit-funds/paypal-credit-deposit-funds.component';
import { ChooseDepositeMethodComponent } from './choose-deposite-method/choose-deposite-method.component';
import { Observable } from 'rxjs';
import { AccountAPIService } from '@services/API/account-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { CheckDepositComponent } from './check-deposit/check-deposit.component';
import { WireTransferDepositComponent } from './wire-transfer-deposit/wire-transfer-deposit.component';
import { DonorAdvisedFundDepositComponent } from './donor-advised-fund-deposit/donor-advised-fund-deposit.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Injectable({ providedIn: 'root' })
export class BankAccountListResolver {
  constructor(private accountAPI: AccountAPIService, private localStorage: LocalStorageDataService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string | any> {
    const username = this.localStorage.getLoginUserUserName();
    return this.accountAPI.getBankAccounts(username);
  }
}

const routes: Routes = [
  {
    path: '',
    resolve: {
      accounts: BankAccountListResolver,
    },
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: 'paypal-creditcard',
        component: PaypalCreditDepositFundsComponent,
      },
      {
        path: 'wire-transfer',
        component: WireTransferDepositComponent,
      },
      {
        path: 'check',
        component: CheckDepositComponent,
      },
      {
        path: 'daf',
        component: DonorAdvisedFundDepositComponent,
      },
      {
        path: 'choose-deposite-method',
        component: ChooseDepositeMethodComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), NgSelectModule],
  exports: [RouterModule],
})
export class AddFundsRoutingModule {}
