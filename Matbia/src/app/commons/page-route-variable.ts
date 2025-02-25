import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PageRouteVariable {
  public static LandingPageUrl = '';
  public static ReturnPageUrl = '/';
  public static AuthMainUrl = 'auth';
  public static AuthLoginUrl = '';
  public static AuthRegisterUrl = 'login';
  public static AppSignupUrl = 'signup';

  public static DashboardUrl = 'dashboard';
  public static SendMeCardUrl = 'send-me-card';
  public static ActivateCard = 'activate-card';
  public static SendMeEmail = 'send-me-email';
  public static AccountFound = 'account-found';
  public static CreateAccountPage = 'create-account-page';
  public static CardLogin = 'card-login';
  public static EnterPassword = 'enter-password';
  public static SetupAlertSetting = 'setup-alert-setting';

  // in Panel
  public static DonateUrl = 'donate';
  public static AddFundsUrl = 'add-funds';
  public static AutoDepositUrl = 'auto-deposit';
  public static InternalTransferUrl = 'internal-transfer';
  public static WithdrawFundsUrl = 'withdraw-funds';
  public static TransactionPageUrl = 'transaction';
  public static RequestsUrl = 'requests';
  public static SchedulesUrl = 'schedules';

  public static ProfileUrl = 'profile';
  public static ProcessCardUrl = 'process-card';
  public static AccountsUrl = 'accounts';
  public static CardsUrl = 'cards';
  public static BankAccountUrl = 'bank-accounts';
  public static NotificationUrl = 'notifications';

  public static AdminUrl = 'admin';
  public static OrderTokenBooksUrl = 'order-token-book';

  public static BatchesUrl = 'batches';

  public static IntegrationUrl = 'integration';
  public static TokenUrl = 'token';
  public static ProcessTokenUrl = 'process-token';
  public static TokenSettingsUrl = 'settings';
  public static OrgSignupUrl = 'org-signup';
  public static CardEmailLoginScenariosUrl = 'scenarios';

  public static statementAndReportsUrl = 'statement-report';

  //  sidebar
  getDashboardRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}`];
  }

  getDonateRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.DonateUrl}`];
  }

  getAddFundsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AddFundsUrl}`];
  }

  getPaypalCreditCardFundsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AddFundsUrl}/paypal-creditcard`];
  }

  getWireTransferFundsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AddFundsUrl}/wire-transfer`];
  }

  getCheckFundsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AddFundsUrl}/check`];
  }

  getDAFundsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AddFundsUrl}/daf`];
  }

  getChooseDepositeMethodRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AddFundsUrl}/choose-deposite-method`];
  }

  getInternalTransferRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.InternalTransferUrl}`];
  }

  getWithdrawFundsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.WithdrawFundsUrl}`];
  }

  getProcessCardRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.ProcessCardUrl}`];
  }

  getTransactionsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.TransactionPageUrl}`];
  }

  getSchedulesRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.SchedulesUrl}`];
  }

  getRequestsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.RequestsUrl}`];
  }

  getIntegrationsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.IntegrationUrl}`];
  }

  // From Menu bar

  getProfileRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.ProfileUrl}`];
  }

  getAccountsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AccountsUrl}`];
  }

  getCardsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.CardsUrl}`];
  }

  getAddAdditionalCardRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.CardsUrl}/add`];
  }

  getActivateCardRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.CardsUrl}/activate-card`];
  }

  getCardRequestRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.CardsUrl}/request`];
  }

  getNotificationRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.NotificationUrl}`];
  }

  getHelpAndFeedbackRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/help-and-feedback`];
  }

  // #BankAccountUrl
  getBankAccountsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.BankAccountUrl}`];
  }

  getLinkNewAccountRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.BankAccountUrl}/link-new-account`];
  }

  // #Auto-Deposit
  getAutoDepositRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.AutoDepositUrl}`];
  }

  getBatchesRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.BatchesUrl}`];
  }

  getCurrentBatchesRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.BatchesUrl}/current-batch`];
  }

  getBatchClosingOptionsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.BatchesUrl}/batch-closing-options`];
  }

  getTokenListRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.TokenUrl}`];
  }
  getTokenSettingsRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.TokenUrl}/${PageRouteVariable.TokenSettingsUrl}`];
  }
  getGenerateTokensRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.TokenUrl}/create-token`];
  }

  getProcessTokenListRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.ProcessTokenUrl}`];
  }

  getOrderTokenBookRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.OrderTokenBooksUrl}`];
  }

  getSendMeEmailRouterLink(): Array<string> {
    return [`/${PageRouteVariable.SendMeEmail}`];
  }

  getEnterPasswordRouterLink(): Array<string> {
    return [`/${PageRouteVariable.AuthMainUrl}/${PageRouteVariable.EnterPassword}`];
  }

  getCardLoginRouterLink(): Array<string> {
    return [`/${PageRouteVariable.AuthMainUrl}/${PageRouteVariable.CardLogin}`];
  }
  getAuthLoginRouterLink(): Array<string> {
    return [`/${PageRouteVariable.AuthLoginUrl}`];
  }
  getAccountFoundRouterLink(): Array<string> {
    return [`/${PageRouteVariable.AccountFound}`];
  }
  getCreateAccountPageRouterLink(): Array<string> {
    return [`/${PageRouteVariable.CreateAccountPage}`];
  }
  getRegularSignUpRouterLink(): Array<string> {
    return [`/${PageRouteVariable.AppSignupUrl}`];
  }
  getDashBoardRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}`];
  }

  getStatementReportRouterLink(): Array<string> {
    return [`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.statementAndReportsUrl}`];
  }
}
