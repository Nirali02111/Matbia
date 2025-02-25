import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserTypes } from '@enum/UserTypes';
import { PageRouteVariable } from '@commons/page-route-variable';
import { RoleAccessGuard } from '@commons/guards/role-access.guard';
import { NeedAuthGuardGuard } from '@commons/guards/need-auth-guard.guard';

import { PanelLayoutComponent } from './panel-layout/panel-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HelpAndFeedbackComponent } from './dashboard/help-and-feedback/help-and-feedback.component';
import { EnterDonorPortalComponent } from './dashboard/enter-donor-portal/enter-donor-portal.component';
import { CSLogPortalComponent } from './dashboard/cslog-portal/cslog-portal.component';
import { StatementsAndReportsComponent } from './statements-and-reports/statements-and-reports.component';

const routes: Routes = [
  {
    path: '',
    component: PanelLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'enter-donor-portal',
        component: EnterDonorPortalComponent,
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.REPORT],
        },
      },
      {
        path: 'logs',
        component: CSLogPortalComponent,
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.REPORT],
        },
      },

      {
        path: 'help-and-feedback',
        component: HelpAndFeedbackComponent,
      },
      {
        path: 'statement-report',
        component: StatementsAndReportsComponent,
      },
      {
        path: PageRouteVariable.DonateUrl,
        loadChildren: () => import('./donate/donate.module').then((m) => m.DonateModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },
      {
        path: PageRouteVariable.AddFundsUrl,
        loadChildren: () => import('./add-funds/add-funds.module').then((m) => m.AddFundsModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },

      {
        path: PageRouteVariable.AutoDepositUrl,
        loadChildren: () => import('./auto-deposit/auto-deposit.module').then((m) => m.AutoDepositModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },

      {
        path: PageRouteVariable.InternalTransferUrl,
        loadChildren: () =>
          import('./internal-transfer/internal-transfer.module').then((m) => m.InternalTransferModule),
      },
      {
        path: PageRouteVariable.WithdrawFundsUrl,
        loadChildren: () => import('./withdraw-funds/withdraw-funds.module').then((m) => m.WithdrawFundsModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.BUSINESS, UserTypes.ORGANIZATION],
        },
      },
      {
        path: PageRouteVariable.TransactionPageUrl,
        loadChildren: () => import('./transactions/transactions.module').then((m) => m.TransactionsModule),
      },
      {
        path: PageRouteVariable.SchedulesUrl,
        loadChildren: () => import('./schedules/schedules.module').then((m) => m.SchedulesModule),
      },
      {
        path: PageRouteVariable.RequestsUrl,
        loadChildren: () => import('./requests/requests.module').then((m) => m.RequestsModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR, UserTypes.BUSINESS, UserTypes.ORGANIZATION],
        },
      },

      {
        path: PageRouteVariable.ProcessCardUrl,
        loadChildren: () => import('./process-card/process-card.module').then((m) => m.ProcessCardModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.BUSINESS, UserTypes.ORGANIZATION],
        },
      },

      //
      {
        path: PageRouteVariable.ProfileUrl,
        loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule),
      },

      {
        path: PageRouteVariable.AccountsUrl,
        loadChildren: () => import('./accounts/accounts.module').then((m) => m.AccountsModule),
      },

      {
        path: PageRouteVariable.CardsUrl,
        loadChildren: () => import('./cards/cards.module').then((m) => m.CardsModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },

      {
        path: PageRouteVariable.BankAccountUrl,
        loadChildren: () => import('./bank-accounts/bank-accounts.module').then((m) => m.BankAccountsModule),
      },

      {
        path: PageRouteVariable.BatchesUrl,
        loadChildren: () => import('./batches/batches.module').then((m) => m.BatchesModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.BUSINESS, UserTypes.ORGANIZATION],
        },
      },

      {
        path: PageRouteVariable.NotificationUrl,
        loadChildren: () => import('./notifications/notifications.module').then((m) => m.NotificationsModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },

      {
        path: PageRouteVariable.IntegrationUrl,
        loadChildren: () => import('./integration/integration.module').then((m) => m.IntegrationModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.BUSINESS, UserTypes.ORGANIZATION],
        },
      },

      {
        path: PageRouteVariable.TokenUrl,
        loadChildren: () => import('./tokens/tokens.module').then((m) => m.TokensModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },

      {
        path: PageRouteVariable.ProcessTokenUrl,
        loadChildren: () => import('./process-token/process-token.module').then((m) => m.ProcessTokenModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.BUSINESS, UserTypes.ORGANIZATION],
        },
      },
      {
        path: PageRouteVariable.OrderTokenBooksUrl,
        loadChildren: () => import('./order-token-book/order-token-book.module').then((m) => m.OrderTokenBookModule),
        canActivate: [RoleAccessGuard],
        data: {
          role: [UserTypes.DONOR, UserTypes.BUSINESS_DONOR],
        },
      },
    ],
    canActivateChild: [NeedAuthGuardGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPanelRoutingModule {}
