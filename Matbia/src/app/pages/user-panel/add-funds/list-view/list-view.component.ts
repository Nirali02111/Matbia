import { CommonDataService } from '@commons/common-data-service.service';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionStatus } from '@enum/Transaction';

import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { AddFundsFromBankComponent } from '@matbia/matbia-form-group/add-funds-from-bank/add-funds-from-bank.component';

import { PanelPopupsService } from '../../popups/panel-popups.service';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { TransactionAPIService } from '@services/API/transaction-api.service';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from '@services/analytics.service';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import { DepositFundsViaBankAccountComponent } from '@matbia/matbia-form-group/deposit-funds-via-bank-account/deposit-funds-via-bank-account.component';
import { MatbiaObserverService } from '@commons/matbia-observer.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ChooseDepositeMethodComponent } from '../choose-deposite-method/choose-deposite-method.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    ChooseDepositeMethodComponent,
    MatbiaSkeletonLoaderComponentComponent,
    DepositFundsViaBankAccountComponent,
  ],
})
export class ListViewComponent implements OnInit, AfterViewInit {
  isLoading = false;
  matbiaAddFundForm!: UntypedFormGroup;
  accountData: BankAccount[] = [];
  isDevEnv = false;
  isProdEnv = false;

  displayDepositMethods = signal<boolean>(false);

  @ViewChild(AddFundsFromBankComponent, { static: false }) addFundComponent!: AddFundsFromBankComponent;

  @ViewChild(DepositFundsViaBankAccountComponent, { static: false })
  depositeFundBankComponent!: DepositFundsViaBankAccountComponent;

  constructor(
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private localStorage: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private panelPopupService: PanelPopupsService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private transactionAPI: TransactionAPIService,
    private donorTransactionAPI: DonorTransactionAPIService,
    private notification: NotificationService,
    private analytics: AnalyticsService,
    private accountAPI: AccountAPIService,
    private matbiaObserver: MatbiaObserverService,
    private commonDataService: CommonDataService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
    this.matbiaObserver.prodMode$.subscribe((val) => {
      this.isProdEnv = val;
    });
    this.title.setTitle('Matbia - Add funds');
    const username = this.localStorage.getLoginUserUserName();
    this.matbiaAddFundForm = this.matbiaFormGroupService.initAddFundFormGroup({
      isRecurring: false,
      isDonate: false,

      userHandle: username,
      amount: null,
      bankAccountId: null,
      transDate: '',
      transferNowAmount: null,
      isNotifyOnEmail: true,
      isNotifyOnSMS: false,
      recurringPayment: {
        count: null,
        amount: null,
        frequency: null,
        scheduleDate: null,
      },
    });

    this.activeRoute.data.subscribe((data) => {
      if (data.accounts && data.accounts.data && data.accounts.data.length !== 0) {
        this.displayDepositMethods.set(false);
      } else {
        this.displayDepositMethods.set(true);
      }
    });
  }

  ngAfterViewInit(): void {
    // call Deposit if come from Link bank account
    this.activeRoute.queryParamMap.subscribe((param) => {
      const value = param.get('addFunds');
      if (value) {
        const resetApiData = this.localStorage.getImmediateFunding();
        if (resetApiData) {
          this.matbiaAddFundForm.patchValue({
            amount: resetApiData.amount,
            bankAccountId: resetApiData.bankAccountId,
          });
          this.matbiaAddFundForm.updateValueAndValidity();
          this.changeDetectorRef.detectChanges();
          this.addFundComponent.bankAccountListLoaded.subscribe(() => {
            this.doDeposit(resetApiData);
          });
        }
      }
    });
  }

  getAccountsRouterLink() {
    return this.pageRoute.getAccountsRouterLink();
  }

  goToAutoDepositsPage() {
    this.router.navigate(this.pageRoute.getAutoDepositRouterLink());
  }

  onChooseOtherOptions() {
    this.displayDepositMethods.set(true);
  }

  onAddFunds() {
    if (this.matbiaAddFundForm.invalid) {
      this.matbiaAddFundForm.markAllAsTouched();
      return;
    }

    const value = this.depositeFundBankComponent.finalDepositValues();

    const userId = this.localStorage.getLoginUserId();

    if (!userId) {
      this.forceLogOut();
      return;
    }

    const apidata = {
      ...value,
      createdBy: userId,
    };

    if (apidata.immediateFundingSection && apidata.isImmediateFunding) {
      if (apidata.bothTokenMissing) {
        this.localStorage.setImmediateFunding(apidata);
        this.router.navigate(this.pageRoute.getLinkNewAccountRouterLink(), { queryParams: { addFunds: true } });
        return;
      }
    }
    this.doDeposit(apidata);
  }

  doDeposit(apiData: any) {
    const confModalRef = this.depositeFundBankComponent.openConfirmation();

    confModalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (!val) {
        return;
      }
      if (apiData.immediateFundingSection && apiData.isImmediateFunding) {
        if (!apiData.bothTokenMissing) {
          this.isLoading = true;
          this.transactionAPI.convertSilaAccountToACH(apiData.bankAccountId).subscribe(
            () => {
              this.isLoading = false;
              this.executeDeposit(apiData);
            },
            (err) => {
              this.isLoading = false;
              this.notification.showError(err.error);
            }
          );
          return;
        }

        return;
      }

      this.executeDeposit(apiData);
    });
  }

  private executeDeposit(apiData: any) {
    this.localStorage.clearImmediateFunding();
    const loader = this.notification.initLoadingPopup({ showCancelButton: false });
    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
        return;
      }
    });

    this.donorTransactionAPI.deposit(apiData).subscribe(
      (res) => {
        if (res) {
          let objPayload = {
            userHandle: this.localStorage.getLoginUserUserName(),
            authImage: this.commonDataService.screenshotImage,
            dbTransId: res.dbTransId,
          };
          this.donorTransactionAPI.savedeposit(objPayload).subscribe(() => {});
        }
        this.notification.hideLoader();
        this.notification.close();
        this.analytics.initAddFundsEvent();
        const modelRef = this.panelPopupService.openAfterTransactionPopup();
        modelRef.componentInstance.amount = apiData.amount;
        modelRef.componentInstance.bankAccount = this.depositeFundBankComponent.linkedAccountList.find(
          (o) => o.bankAccountId === apiData.bankAccountId
        );

        modelRef.closed.subscribe((val: boolean) => {
          if (val) {
            let isRedirectFromVoucher = this.localStorage.getIsRedirectFromVoucherPage();
            if (isRedirectFromVoucher == 'true') {
              localStorage.removeItem('isRedirectFromVoucherPage');
              this.localStorage.setIsRedirectFromVoucherPage('false');
              this.router.navigate(this.pageRoute.getOrderTokenBookRouterLink());
            } else {
              this.router.navigate(this.pageRoute.getDashboardRouterLink());
            }
          }
        });

        modelRef.componentInstance.status = res.status;
        // Do first check it's schedule or not
        if (res.status === TransactionStatus.SCHEDULED) {
          modelRef.componentInstance.isSuccess = true;
          modelRef.componentInstance.depositAvailable = res.depositAvailable;
          modelRef.componentInstance.dbTransId = res.encryptedDbTransId;
          return;
        }

        if (!res.gatewayResponse) {
          modelRef.componentInstance.isSuccess = false;
          modelRef.componentInstance.errorMessage = res.status;
          return;
        }

        if (res.gatewayResponse?.errors.length !== 0) {
          modelRef.componentInstance.isSuccess = false;
          modelRef.componentInstance.errorMessage = res.gatewayResponse?.errors[0].error;

          if (res?.error && res?.error.length !== 0) {
            modelRef.componentInstance.errorMessageFromServer = res?.error[0].error;
          }
          return;
        }

        if (res.error && res?.error.length !== 0) {
          modelRef.componentInstance.isSuccess = false;
          modelRef.componentInstance.errorMessageFromServer = res?.error[0].error;
          return;
        }

        modelRef.componentInstance.isSuccess = true;
        modelRef.componentInstance.dbTransId = res.encryptedDbTransId;
        modelRef.componentInstance.depositAvailable = res.depositAvailable;
      },
      (err) => {
        this.notification.hideLoader();
        this.notification.close();
        const modelRef = this.panelPopupService.openAfterTransactionPopup();
        modelRef.componentInstance.amount = apiData.amount;
        modelRef.componentInstance.bankAccount = this.addFundComponent.linkedAccountList.find(
          (o) => o.bankAccountId === apiData.bankAccountId
        );

        modelRef.componentInstance.isSuccess = false;
        modelRef.componentInstance.errorMessage = err.error;

        modelRef.closed.subscribe(() => {
          this.router.navigate(this.pageRoute.getDashboardRouterLink());
        });
      }
    );
  }

  private forceLogOut() {
    const authPage = '/' + PageRouteVariable.AuthMainUrl;
    this.localStorage.setLoginUserDataAndToken(null);
    this.router.navigate([authPage], { queryParams: { returnUrl: this.router.url } });
  }

  getAccountList(username: string) {
    this.isLoading = true;
    this.accountAPI.getBankAccounts(username).subscribe(
      (res) => {
        this.isLoading = false;

        if (res && res.data && res.data.length !== 0) {
          this.accountData = res.data;
          return;
        }

        this.displayDepositMethods.set(true);
      },
      () => {}
    );
  }
}
