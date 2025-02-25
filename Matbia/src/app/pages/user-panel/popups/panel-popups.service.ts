import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { AfterTransactionComponent } from '@matbia/matbia-shared-popup/after-transaction/after-transaction.component';
import { CardLockPopupComponent } from '@matbia/matbia-shared-popup/card-lock-popup/card-lock-popup.component';
import { CardReplacePopupComponent } from '@matbia/matbia-shared-popup/card-replace-popup/card-replace-popup.component';
import { LinkViaRoutingPopupComponent } from '@matbia/matbia-shared-popup/link-via-routing-popup/link-via-routing-popup.component';
import { EditAddressPopupComponent } from '@matbia/matbia-shared-popup/edit-address-popup/edit-address-popup.component';
import { RequestCardPopupComponent } from '@matbia/matbia-shared-popup/request-card-popup/request-card-popup.component';
import { AfterDonationPopupComponent } from '@matbia/matbia-shared-popup/after-donation-popup/after-donation-popup.component';
import { ProcessWithdrawFundConfirmPopupComponent } from '@matbia/matbia-shared-popup/process-withdraw-fund-confirm-popup/process-withdraw-fund-confirm-popup.component';
import { AfterWithdrawFundConfirmPopupComponent } from '@matbia/matbia-shared-popup/after-withdraw-fund-confirm-popup/after-withdraw-fund-confirm-popup.component';
import { AutomaticTransfersPopupComponent } from '@matbia/matbia-shared-popup/automatic-transfers-popup/automatic-transfers-popup.component';

import { USPSResponsePopupComponent } from '@matbia/matbia-usps/uspsresponse-popup/uspsresponse-popup.component';
import { PDFViewPopupComponent } from '@matbia/matbia-shared-popup/pdfview-popup/pdfview-popup.component';

import { ScheduleDetailsPopupComponent } from './../popups/schedule-details-popup/schedule-details-popup.component';
import { SetReminderPopupComponent } from './../popups/set-reminder-popup/set-reminder-popup.component';
import { LinkViaProcessorTokenComponent } from './../popups/link-via-processor-token/link-via-processor-token.component';

import { RedeemDonationPopupComponent } from './redeem-donation-popup/redeem-donation-popup.component';
import { DepositReceiptPopupComponent } from './deposit-receipt-popup/deposit-receipt-popup.component';
import { DeleteBankAccountConfirmPopupComponent } from './delete-bank-account-confirm-popup/delete-bank-account-confirm-popup.component';
import { TimeOutPopupComponent } from './time-out-popup/time-out-popup.component';
import { ReportMissingOrganizationComponent } from './report-missing-organization/report-missing-organization.component';

import { CancelDonationPopupComponent } from './cancel-donation-popup/cancel-donation-popup.component';
import { CancelDepositPopupComponent } from './cancel-deposit-popup/cancel-deposit-popup.component';

import { CloseCurrentBatchPopupComponent } from './close-current-batch-popup/close-current-batch-popup.component';
import { EditScheduleDepositConfirmPopupComponent } from './edit-schedule-deposit-confirm-popup/edit-schedule-deposit-confirm-popup.component';
import { EditNotePopupComponent } from './edit-note-popup/edit-note-popup.component';
import { DonationHistoryPopupComponent } from './donation-history-popup/donation-history-popup.component';
import { TokenBookTransactionPopupComponent } from './token-book-transaction-popup/token-book-transaction-popup.component';
import { CancelTokenPopupComponent } from './cancel-token-popup/cancel-token-popup.component';
import { TokenEmailPopupComponent } from './token-email-popup/token-email-popup.component';
import { TokenSmsPopupComponent } from './token-sms-popup/token-sms-popup.component';
import { TokenSettingsComponent } from '../tokens/token-settings/token-settings.component';

@Injectable()
export class PanelPopupsService {
  modalOptions: NgbModalOptions = {
    centered: true,
    backdrop: 'static',
    keyboard: false,
    windowClass: 'drag_popup',
    size: 'xl',
    scrollable: true,
  };

  constructor(private modalService: NgbModal) { }

  getService(): NgbModal {
    return this.modalService;
  }

  open(content: any, modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(content, modalOptions ? modalOptions : this.modalOptions);
  }

  openScheduleDetail(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(ScheduleDetailsPopupComponent, {
      ...this.modalOptions,
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'schedule--modal',
      size: 'xl',
      scrollable: true,
      ...modalOptions,
    });
  }

  openSetReminder(): NgbModalRef {
    const opt: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'set-reminder--modal',
      scrollable: true,
      centered: true,
      fullscreen: 'md',
    };

    return this.modalService.open(SetReminderPopupComponent, opt);
  }

  openAddBankAccount(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(LinkViaRoutingPopupComponent, modalOptions ? modalOptions : this.modalOptions);
  }

  openDeleteBankAccountConfirm(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      ...modalOptions,
      windowClass: 'delete-bank-account-confirm-popup',
    };

    return this.modalService.open(DeleteBankAccountConfirmPopupComponent, tmpModalOptions);
  }

  openLinkViaProcessorToken(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(LinkViaProcessorTokenComponent, modalOptions ? modalOptions : this.modalOptions);
  }

  openAfterDonationPopup(modalOptions?: NgbModalOptions): NgbModalRef {
    const tmpModalOptions = {
      ...this.modalOptions,
      windowClass: 'after-donation-popup donate-popup modal-funds',
      size: 'md',
    };

    return this.modalService.open(AfterDonationPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openTermsAndCondition(): NgbModalRef {
    const opt: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup',
      size: 'xl',
      scrollable: true,
    };
    return this.modalService.open(TermsOfServicePopupComponent, opt);
  }

  openAfterTransactionPopup(modalOptions?: NgbModalOptions): NgbModalRef {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'transaction-modal-main modal-afterTransaction modal-funds modal-transactionReceived',
    };

    return this.modalService.open(AfterTransactionComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openUSPSContinue(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'usps-modal-main',
    };

    return this.modalService.open(USPSResponsePopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openAutomaticTransfers(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'automatic-transfers-modal',
    };

    return this.modalService.open(AutomaticTransfersPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openRedeemDonationPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'redeem-donation-modal',
    };

    return this.modalService.open(RedeemDonationPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openRedeemDonationConfirmPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'donate-popup',
    };

    return this.modalService.open(
      ProcessWithdrawFundConfirmPopupComponent,
      modalOptions ? modalOptions : tmpModalOptions
    );
  }

  openAfterRedeemDonationPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'donate-popup',
    };

    return this.modalService.open(
      AfterWithdrawFundConfirmPopupComponent,
      modalOptions ? modalOptions : tmpModalOptions
    );
  }

  openCardLockPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'card-lock-modal-popup ',
      modalDialogClass: 'modal-dialog-centered',
    };

    return this.modalService.open(CardLockPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openReplaceCardPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'card-replace-modal-popup ',
      modalDialogClass: 'modal-dialog-centered',
    };

    return this.modalService.open(CardReplacePopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openDepositReceiptPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'deposit-receipt-modal',
    };

    return this.modalService.open(DepositReceiptPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openPDFViewPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'deposit-receipt-modal',
    };

    return this.modalService.open(PDFViewPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openTimeoutPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'time-out-modal',
    };

    return this.modalService.open(TimeOutPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openReportMissingOrganization(modalOptions?: NgbModalOptions) {
    const tmpModalOptions: NgbModalOptions = {
      ...this.modalOptions,
      size: 'lg',
      windowClass: 'report-missing-organization-modal',
      centered: true,
      fullscreen: 'md',
    };

    return this.modalService.open(ReportMissingOrganizationComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openCancelDonationPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'cancel-deposit-modal cancel-donation-modal',
    };

    return this.modalService.open(CancelDonationPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openCancelDepositPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'cancel-deposit-modal',
    };

    return this.modalService.open(CancelDepositPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openEditAddressPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'edit-your-address-popup',
    };

    return this.modalService.open(EditAddressPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openCardRequestPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'request-card-pop',
    };

    return this.modalService.open(RequestCardPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openCloseCurrentBatchPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'close-current-batch-popup modal-batch',
    };

    return this.modalService.open(CloseCurrentBatchPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openEditScheduleConfirmPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'cancel-deposit-modal',
    };

    return this.modalService.open(
      EditScheduleDepositConfirmPopupComponent,
      modalOptions ? modalOptions : tmpModalOptions
    );
  }

  openEditNotePopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      size: 'md',
      windowClass: 'edit-note-modal',
    };

    return this.modalService.open(EditNotePopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openDonationHistoryPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      centered: true,
      keyboard: false,
      windowClass: 'sidebar_modal donation_modal',
      size: 'md',
      scrollable: true,
    };

    return this.modalService.open(DonationHistoryPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openTokenBookPopup(modalOptions?: NgbModalOptions) {
    const tmpModalOptions = {
      ...this.modalOptions,
      centered: true,
      keyboard: false,
      windowClass: 'sidebar_modal token_book_modal',
      size: 'md',
      scrollable: true,
    };

    return this.modalService.open(TokenBookTransactionPopupComponent, modalOptions ? modalOptions : tmpModalOptions);
  }

  openTokenSettingsPopup(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(TokenSettingsComponent, modalOptions ? modalOptions : this.modalOptions);
  }

  openCancelTokenPopup(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(CancelTokenPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
      ...modalOptions,
    });
  }

  openShareTokenSMSPopup(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(TokenSmsPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
      ...modalOptions,
    });
  }

  openShareTokenEmailPopup(modalOptions?: NgbModalOptions): NgbModalRef {
    return this.modalService.open(TokenEmailPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
      ...modalOptions,
    });
  }
}
