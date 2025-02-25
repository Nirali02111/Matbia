import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { Assets } from '@enum/Assets';
import { TransactionStatus, TransactionTypes } from '@enum/Transaction';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { TransactionAPIService } from '@services/API/transaction-api.service';
import { DonorTransactionAPIService, GetOrgDonationHistoryPayload } from '@services/API/donor-transaction-api.service';

import { DonorTransactionObj } from 'src/app/models/panels';
import { PanelPopupsService } from 'src/app/pages/user-panel/popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { IsHebrewDirective } from '@matbia/matbia-directive/is-hebrew.directive';

@Component({
  selector: 'app-transaction-row-item',
  templateUrl: './transaction-row-item.component.html',
  styleUrls: ['./transaction-row-item.component.scss'],
  imports: [SharedModule, IsHebrewDirective],
})
export class TransactionRowItemComponent implements OnInit {
  isLoading = false;
  isBatchVisible = false;
  isDevEnv = false;
  isbatchVisible = false;

  estimatedMsg = 'ESTIMATED TO COMPLETE IN 5 BUSINESS DAYS.';
  estimatedPayMsg = 'Estimated to complete on the 25th of the month';

  @Input() item!: DonorTransactionObj;
  HideTokendetails = input(false);
  @Output() refresh = new EventEmitter();
  selectedDates = {
    fromDate: '',
    toDate: '',
  };

  get Assets() {
    return Assets;
  }

  get isDonor() {
    return this.localStorage.isDonor();
  }

  get isBusiness() {
    return this.localStorage.isBusiness();
  }

  get isOrganization() {
    return this.localStorage.isOrganization();
  }

  /**
   * Type
   */
  get isDonation(): boolean {
    return this.item.transType === TransactionTypes.DONATION;
  }

  get isDonationTransfer(): boolean {
    return this.item.transType === TransactionTypes.DONATION_TRANSFER;
  }

  get isDeposit(): boolean {
    return this.item.transType === TransactionTypes.DEPOSIT;
  }

  get isMatbiaFee(): boolean {
    return this.item.transType === TransactionTypes.MATBIA_FEE;
  }

  get isRefund(): boolean {
    return this.item.transType === TransactionTypes.REFUND;
  }

  get isRedeemed(): boolean {
    return this.item.transType === TransactionTypes.REDEEMED;
  }

  get isFailedDeposit(): boolean {
    return this.item.transType === TransactionTypes.FAILED_DEPOSIT;
  }

  /**
   * Status
   */

  get isSuccess(): boolean {
    return this.item.transStatus === TransactionStatus.SUCCESS;
  }

  get isPending(): boolean {
    return this.item.transStatus === TransactionStatus.PENDING;
  }

  get isFailed(): boolean {
    return this.item.transStatus === TransactionStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.item.transStatus === TransactionStatus.CANCELLED;
  }

  get isVoided(): boolean {
    return this.item.transStatus === TransactionStatus.VOIDED;
  }

  get isFunding(): boolean {
    return this.item.transStatus === TransactionStatus.FUNDING;
  }

  get isGenerated(): boolean {
    return (
      (this.item.transStatus === TransactionStatus.GENERATED ||
        this.item.transStatus === TransactionStatus.EXPIRED ||
        this.item.transStatus === TransactionStatus.SUCCESS) &&
      !!this.item.bookNumber
    );
  }

  get isDeclined(): boolean {
    return this.item.transStatus === TransactionStatus.DECLINED;
  }

  get isExpired(): boolean {
    return this.item.transStatus === TransactionStatus.EXPIRED;
  }

  get isCancelable(): boolean {
    if (!this.item.transDate) {
      return false;
    }

    const duration = moment.duration(moment().diff(moment(this.item.transDate))).asHours();
    return duration < 12 ? true : false;
  }

  get CollapseUniqId() {
    return `collapseExample_${this.item.refNum ? this.item.refNum : this.item.transactionId}`;
  }

  get isTransDateEqual() {
    return this.item.tokenBookDetails?.tokenBookList?.filter((i) => i.transDate === this.item.transDate) || [];
  }

  constructor(
    private router: Router,
    private pageRoute: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private commonDataService: CommonDataService,
    private matbiaObserver: MatbiaObserverService,
    private notification: NotificationService,
    private panelPopupService: PanelPopupsService,
    private transactionAPI: TransactionAPIService,
    private donorTransactionAPI: DonorTransactionAPIService
  ) {}

  ngOnInit(): void {
    if (this.item.transDate) {
      this.item.transDate = moment(this.commonDataService.getUTCFromEST(this.item.transDate)).format();
    }

    this.matbiaObserver.batchVisible$.subscribe((val) => {
      this.isBatchVisible = val;
    });

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
    if (this.isGenerated || this.isVoided) {
      if (this.item.bookNumber && (this.item?.tokenBookDetails?.tokenBookList || []).length !== 1) {
        this.donorTransactionAPI
          .getTokenBook({
            bookNumber: this.item.bookNumber,
          })
          .subscribe((res) => {
            if (res && res.length !== 0) {
              this.item.organization = res[0].bookName + ' Tokens Book' || '';
            }
          });
      }
    }
    if (this.item.transStatus === TransactionStatus.GENERATED && !this.item.bookNumber) {
      this.item.organization = `$${-this.item.amount} Token`;
      this.item.method = `Token: ${this.item.method}`;
    }
    if (
      (this.item.transStatus === TransactionStatus.VOIDED &&
        !this.item.bookNumber &&
        this.item.note?.includes('Token')) ||
      (this.item.transStatus === TransactionStatus.EXPIRED &&
        !this.item.bookNumber &&
        this.item.note?.includes('Token'))
    ) {
      this.item.organization = `$${-this.item.amount} Token`;
      this.item.method = `Token: ${this.item.method}`;
    }
  }

  voidClick() {
    const modalRef = this.panelPopupService.openCancelDonationPopup();
    modalRef.componentInstance.amount = this.item.amount;
    modalRef.componentInstance.isRedeem = this.isRedeemed;
    modalRef.componentInstance.confirm.subscribe((proceed: boolean) => {
      if (proceed) {
        this.doVoid();
      }
    });
  }

  cancelDeposit() {
    const modalRef = this.panelPopupService.openCancelDepositPopup();
    modalRef.componentInstance.amount = this.item.amount;
    modalRef.componentInstance.confirm.subscribe((proceed: boolean) => {
      if (proceed) {
        this.doCancel();
      }
    });
  }

  refundClick() {
    const modalRef = this.panelPopupService.openCancelDonationPopup();
    modalRef.componentInstance.amount = this.item.amount;
    modalRef.componentInstance.isRefund = true;
    modalRef.componentInstance.confirm.subscribe((proceed: boolean) => {
      if (proceed) {
        this.doRefund();
      }
    });
  }

  private doVoid() {
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.refresh.emit(true);
      }
    });

    if (this.isRedeemed) {
      this.doRedeemCancel();
      return;
    }

    this.donorTransactionAPI
      .voidTransaction({
        transId: this.item.encryptedTransId,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.close();

          if (res.status === TransactionStatus.FAILED) {
            this.openCancelDonationMessage(false, res.donaryErrorResponse);
            return;
          }

          this.openCancelDonationMessage();
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  private doRedeemCancel() {
    const username = this.localStorage.getLoginUserUserName();
    this.transactionAPI
      .CancelRedeem({
        userHandle: username,
        dbTransId: this.item.encryptedTransId,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.close();

          if (!res.success) {
            this.openCancelDonationMessage(false, res.message);
            return;
          }

          this.openCancelDonationMessage(false, '', res.message);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  private doCancel() {
    this.notification.initLoadingPopup();

    const username = this.localStorage.getLoginUserUserName();
    this.transactionAPI
      .CancelDeposit({
        userHandle: username,
        dbTransId: this.item.encryptedTransId,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.close();

          if (!res.success) {
            this.notification.displayError(res.message);
            return;
          }

          this.openCancelDepositMessage();
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  private doRefund() {
    this.notification.initLoadingPopup();

    this.donorTransactionAPI.refundTransaction(this.item.encryptedTransId).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.close();

        if (res.status === TransactionStatus.FAILED) {
          this.openCancelDonationMessage(true, res.donaryErrorResponse);
          return;
        }

        this.openCancelDonationMessage(true);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  private openCancelDonationMessage(isRefund = false, errorResponse = '', successResponse = '') {
    const modalRef = this.panelPopupService.openCancelDonationPopup();
    modalRef.componentInstance.isConfirmation = false;
    modalRef.componentInstance.amount = this.item.amount;
    modalRef.componentInstance.isRefund = isRefund;
    modalRef.componentInstance.isRedeem = this.isRedeemed;
    modalRef.componentInstance.successResponse = successResponse;

    modalRef.componentInstance.errorResponse = errorResponse;
    modalRef.componentInstance.refresh.subscribe(() => {
      this.refresh.emit(true);
    });
  }

  private openCancelDepositMessage() {
    const modalRef = this.panelPopupService.openCancelDepositPopup();
    modalRef.componentInstance.isConfirmation = false;
    modalRef.componentInstance.amount = this.item.amount;
    modalRef.componentInstance.refresh.subscribe(() => {
      this.refresh.emit(true);
    });
  }

  depositReceipt() {
    const modalRef = this.panelPopupService.openDepositReceiptPopup();
    modalRef.componentInstance.transactionId = this.item.encryptedTransId;
  }

  viewBatch() {
    this.router.navigate(this.pageRoute.getTransactionsRouterLink(), {
      queryParams: {
        batchNum: this.item.batchNum,
        isInBatchClicked: true,
      },
    });
  }

  onEditNote(event: any) {
    event.stopPropagation();
    const modalRef = this.panelPopupService.openEditNotePopup();
    modalRef.componentInstance.note = this.item.note;
    modalRef.componentInstance.transactionId = this.item.transactionId;
    modalRef.componentInstance.refresh.subscribe((res: boolean) => {
      if (res) {
        this.refresh.emit(true);
      }
    });
  }

  openDonationHistoryPopup() {
    if (
      !this.isDonation ||
      this.item.note?.includes('Token') ||
      this.item.bookNumber ||
      this.isExpired ||
      (this.isVoided && this.item.note?.includes('Token'))
    ) {
      return;
    }

    const modalRef = this.panelPopupService.openDonationHistoryPopup();
    modalRef.componentInstance.organizationId = this.item.organizationId;
    modalRef.componentInstance.campaignName = this.item.collector;
    modalRef.componentInstance.orgName = this.item.organization;
  }

  openTokenBookPopup(event: Event) {
    event.preventDefault();

    const modalRef = this.panelPopupService.openTokenBookPopup();

    modalRef.componentInstance.tokenBook = this.item;
  }

  get isToirem() {
    return this.item.organization && this.item.organization.toLowerCase() === 'toirem';
  }

  reDonate() {
    if (this.isToirem) {
      const userHandle = this.localStorage.getLoginUserUserName();

      const apiData: GetOrgDonationHistoryPayload = {
        userHandle: userHandle,
        ...this.selectedDates,
      };

      if (this.item.organizationId) {
        apiData.organizationId = +this.item.organizationId;
      }

      if (this.isToirem) {
        apiData.campaignName = this.item.collector;
      }

      this.donorTransactionAPI
        .getOrgDonationHistory({
          ...apiData,
        })
        .subscribe(
          (res) => {
            this.isLoading = false;
            if (!res) {
              return;
            }
            this.router.navigate([`${this.pageRoute.getDonateRouterLink()}/${this.item.encryptedEntityID}/donate`], {
              queryParams: {
                refNum: this.item.refNum,
                campaignId: res.campaignId,
              },
            });
          },
          () => {
            this.isLoading = false;
          }
        );
    } else {
      this.router.navigate([`${this.pageRoute.getDonateRouterLink()}/${this.item.encryptedEntityID}/donate`], {
        queryParams: {
          refNum: this.item.refNum,
        },
      });
    }
  }
}
