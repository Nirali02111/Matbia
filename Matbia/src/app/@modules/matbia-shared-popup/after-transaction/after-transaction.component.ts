import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { TransactionStatus } from '@enum/Transaction';
import { BankAccount } from '@services/API/account-api.service';
import { TransactionAPIService } from '@services/API/transaction-api.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-after-transaction',
  templateUrl: './after-transaction.component.html',
  styleUrls: ['./after-transaction.component.scss'],
  imports: [SharedModule],
})
export class AfterTransactionComponent implements OnInit {
  isLoading = false;

  transactionVoided = false;

  @Input() isSuccess = false;

  // from Payload
  @Input() amount!: string;

  // from Payload
  @Input() bankAccount!: BankAccount;

  // from Response
  @Input() depositAvailable!: string;

  // from Response
  @Input() errorMessage!: string;

  // from Response
  @Input() errorMessageFromServer!: string;

  // from Response
  @Input() status!: string;

  // check transaction popup is from flow or not. if not from flow then allow close button
  @Input() isInFlow = false;

  // from Response
  @Input() dbTransId!: string;

  /**
   * If transaction is Recurring
   */
  @Input() frequency = '';

  get IsFunding() {
    return this.status && this.status === TransactionStatus.FUNDING;
  }

  get IsScheduled() {
    return this.status && this.status === TransactionStatus.SCHEDULED;
  }

  constructor(
    public activeModal: NgbActiveModal,
    private transactionAPI: TransactionAPIService,
    private localStorage: LocalStorageDataService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {}

  onClose() {
    this.activeModal.close(this.isSuccess);
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onVoid() {
    if (!this.dbTransId) {
      this.notification.showError('Transaction id not found');
      return;
    }
    this.isLoading = true;
    const apiData = {
      userHandle: this.localStorage.getLoginUserUserName(),
      dbTransId: this.dbTransId,
    };

    this.transactionAPI.CancelDeposit(apiData).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (res.success) {
            this.transactionVoided = true;
            this.onClose();
            this.notification.showSuccess(res.message);

            return;
          }

          this.notification.showError(res.message);
        }
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error);
      }
    );
  }
}
