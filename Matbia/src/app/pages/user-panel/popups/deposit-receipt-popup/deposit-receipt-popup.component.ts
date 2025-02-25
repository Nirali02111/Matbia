import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotificationService } from '@commons/notification.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-deposit-receipt-popup',
  templateUrl: './deposit-receipt-popup.component.html',
  styleUrls: ['./deposit-receipt-popup.component.scss'],
  imports: [SharedModule],
})
export class DepositReceiptPopupComponent implements OnInit {
  isLoading = false;
  fileUrl!: SafeResourceUrl;

  @Input() transactionId!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private donorTransAPI: DonorTransactionAPIService,
    private sanitizer: DomSanitizer,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.getReceiptPDFUrl();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  private setFileName(value: string) {
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  getReceiptPDFUrl() {
    this.isLoading = true;
    this.donorTransAPI.depositReceipt(this.transactionId).subscribe(
      (res) => {
        this.isLoading = false;
        this.setFileName(res.receiptUrl);
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error);
      }
    );
  }
}
