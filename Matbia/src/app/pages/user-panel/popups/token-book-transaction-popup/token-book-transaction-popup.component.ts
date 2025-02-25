import { Component, Input, OnInit } from '@angular/core';
import { Assets } from '@enum/Assets';
import { TokenStatus } from '@enum/Token';
import { TransactionStatus } from '@enum/Transaction';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DonorTransactionObj } from 'src/app/models/panels';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-token-book-transaction-popup',
  templateUrl: './token-book-transaction-popup.component.html',
  styleUrl: './token-book-transaction-popup.component.scss',
  imports: [SharedModule],
})
export class TokenBookTransactionPopupComponent implements OnInit {
  @Input({ required: true }) tokenBook!: DonorTransactionObj;
  expiredCount = 0;
  expiredAmount = 0;
  remCount = 0;
  remAmount = 0;

  get Assets() {
    return Assets;
  }

  isGenerated(item: DonorTransactionObj) {
    return item.transStatus === TokenStatus.GENERATED;
  }

  isSuccess(item: DonorTransactionObj) {
    return item.transStatus === TransactionStatus.SUCCESS;
  }

  isProcessed(item: DonorTransactionObj) {
    return item.transStatus === TokenStatus.PROCESSED;
  }

  isExpired(item: DonorTransactionObj) {
    return item.transStatus === TokenStatus.EXPIRED;
  }

  isVoid(item: DonorTransactionObj) {
    return item.transStatus === TokenStatus.VOIDED;
  }

  isPending(item: DonorTransactionObj) {
    return item.transStatus === TransactionStatus.PENDING;
  }

  isFunding(item: DonorTransactionObj) {
    return item.transStatus === TokenStatus.FUNDING;
  }

  isTransDateMatch(item: DonorTransactionObj): boolean {
    try {
      // Parse the ISO date strings
      const tokenBookDate = moment(this.tokenBook.transDate);
      const itemDate = moment(item.transDate);
      // Validate if the parsed dates are valid
      if (!tokenBookDate.isValid() || !itemDate.isValid()) {
        return false;
      }

      // Compare dates only (ignoring time)
      const isMatch = tokenBookDate.isSame(itemDate, 'day');
      return isMatch;
    } catch (error) {
      return false;
    }
  }

  constructor(public activeModal: NgbActiveModal) {}

  closePopup() {
    this.activeModal.dismiss();
  }

  ngOnInit(): void {
    this.addExpiredTokenAmount();
    this.remCount =
      Number(this.tokenBook.tokenBookDetails?.totalCount) -
      (Number(this.tokenBook?.tokenBookDetails?.processCount) + this.expiredCount);
    this.remAmount =
      Number(this.tokenBook.tokenBookDetails?.totalAmount) -
      (Number(this.tokenBook?.tokenBookDetails?.processAmount) + this.expiredAmount);
  }

  addExpiredTokenAmount() {
    const tokenBookList = this.tokenBook.tokenBookDetails?.tokenBookList;

    if (tokenBookList && Array.isArray(tokenBookList)) {
      // Calculate the sum of expired tokens
      const expiredAmount = tokenBookList
        .filter((token) => token.transStatus === 'Expired')
        .reduce((sum, token) => sum + (token.amount || 0), 0);
      const expiredCount = tokenBookList.filter((token) => token.transStatus === 'Expired');

      // Add the expired amount to the main object
      this.expiredAmount = expiredAmount + Number(this.tokenBook?.tokenBookDetails?.voidedCount);
      this.expiredCount = expiredCount?.length + Number(this.tokenBook?.tokenBookDetails?.voidedAmount ?? 0);
    }
  }
}
