import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './list-view/list-view.component';
import { LinkNewAccountComponent } from './link-new-account/link-new-account.component';
import { NoPlaidComponent } from './no-plaid/no-plaid.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: 'link-new-account',
        component: LinkNewAccountComponent,
      },
      {
        path: 'noplaid',
        component: NoPlaidComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankAccountsRoutingModule {}
