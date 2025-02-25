import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { AccountAPIService, BankAccount } from '@services/API/account-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { LinkedAccountRowItemComponent } from '@matbia/matbia-list-row-item/linked-account-row-item/linked-account-row-item.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule, LinkedAccountRowItemComponent, MatbiaSkeletonLoaderComponentComponent],
})
export class ListViewComponent implements OnInit {
  isLoading = false;

  linkedAccountList: Array<BankAccount> = [];

  primaryAccount!: string;

  // when deleting account set that account id
  schedulesFromAccount!: string | null;
  schedulesToAccount!: string | null;

  constructor(
    protected title: Title,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private accountAPI: AccountAPIService,
    private notification: NotificationService,
    private matbiaObserver: MatbiaObserverService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Linked bank accounts');
    this.getAccountList();

    combineLatest(
      this.matbiaObserver.shulKiousk$,
      this.matbiaObserver.blockBankManagement$,
      (shulKiousk, blockBankManagement) => ({
        shulKiousk,
        blockBankManagement,
      })
    ).subscribe((obj) => {
      if (obj.shulKiousk && obj.blockBankManagement) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
      }
    });
  }

  private clearDeleteActionValues() {
    this.schedulesFromAccount = null;
    this.schedulesToAccount = null;
  }

  getAccountList() {
    const username = this.localStorage.getLoginUserUserName();
    this.isLoading = true;
    this.accountAPI.getBankAccounts(username).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.linkedAccountList = response.data;
          const findDefault = response.data.find((o) => o.isDefault);
          if (findDefault) {
            this.primaryAccount = findDefault.bankAccountId;
          }

          this.clearDeleteActionValues();
        }
      },
      (error) => {
        this.isLoading = false;
        console.log(error.error);
      }
    );
  }

  linkNewAccountRouterLink() {
    return this.pageRoute.getLinkNewAccountRouterLink();
  }

  onDeleteAccount() {
    this.getAccountList();
  }

  onSelectPrimary(id: string) {
    this.primaryAccount = id;
  }

  onTransferringSchedules(id: string) {
    this.schedulesFromAccount = id;
  }

  onTransferringSchedulesTo(id: string) {
    this.schedulesToAccount = id;
  }

  onCancelDelete(event: any) {
    event.preventDefault();
    this.clearDeleteActionValues();
  }

  onSaveBankAccount() {
    if (!this.schedulesFromAccount) {
      this.doSetPrimaryAccount();
      return;
    }

    if (this.schedulesFromAccount && !this.schedulesToAccount) {
      this.notification.showError('No Account selected for link your schedules', 'Error!');
      return;
    }

    if (this.schedulesFromAccount && this.schedulesToAccount) {
      this.doDeleteAccountAndSetNewAccount();
    }
  }

  private doSetPrimaryAccount() {
    const deletedBy = this.localStorage.getLoginUserId();

    if (!this.primaryAccount) {
      this.notification.showError('No Default Account selected', 'Error!');
      return;
    }

    this.isLoading = true;

    this.accountAPI.setDefaultBankAccount(this.primaryAccount, deletedBy).subscribe(
      (res) => {
        this.isLoading = false;
        this.notification.showSuccess(res, 'Success!');
        this.getAccountList();
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error, 'Error!');
      }
    );
  }

  private doDeleteAccountAndSetNewAccount() {
    if (!this.schedulesFromAccount || !this.schedulesToAccount) {
      return;
    }

    const loginId = this.localStorage.getLoginUserId();
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.getAccountList();
      }
    });

    this.accountAPI.deleteBankAccount(this.schedulesFromAccount, loginId, this.schedulesToAccount).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.errors && res.errors.length !== 0) {
          this.notification.displayError(res.errors[0].error);
          return;
        }

        this.notification.displaySuccess(res.message);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }
}
