import { CommonDataService } from './../../../../commons/common-data-service.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import html2canvas from 'html2canvas';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-add-balance-confirm-popup',
  templateUrl: './add-balance-confirm-popup.component.html',
  styleUrls: ['./add-balance-confirm-popup.component.scss'],
  imports: [SharedModule],
})
export class AddBalanceConfirmPopupComponent implements OnInit {
  isShulkiosk = false;

  screenshotImage: string | null = null;

  @Input() amount = 0;

  @Input() totalAmount = 0;

  @Input() accountName = '';

  @Input() accountNumber = '';

  @Input() accountType = '';

  @Input() bankName = '';

  @Input() isDeposit = true;

  @Input() startDate = '';

  @Input() endDate = '';

  /**
   * if It's donation
   */
  @Input() organization = '';

  /**
   * If Deposit is Recurring
   */
  @Input() isRecurring = false;

  @Input() frequency = '';

  @Input() count = 0;

  /**
   * If Deposit is AutoReplenish
   */
  @Input() isAutoReplenish = false;

  @Input() triggerAmount = 0;

  @Input() replenishAmount = 0;

  @Output() emtOnConfirm: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private matbiaObserver: MatbiaObserverService,
    private commonDataService: CommonDataService
  ) {}

  ngOnInit(): void {
    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      this.isShulkiosk = val;
    });
  }

  captureWebpageScreenshot() {
    html2canvas(document.body).then((canvas) => {
      const base64Image = canvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, '');
      this.screenshotImage = base64Image;
      this.commonDataService.screenshotImage = this.screenshotImage;
    });
  }

  getCurrentTime() {
    return new Date();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onConfirmClick() {
    if (!this.isAutoReplenish) {
      this.captureWebpageScreenshot();
    }
    this.emtOnConfirm.emit(true);
    this.closePopup();
  }

  openTerms(event: any) {
    event.preventDefault();
    if (this.isShulkiosk) {
      return;
    }
    const opt: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup',
      size: 'xl',
      scrollable: true,
    };
    this.modalService.open(TermsOfServicePopupComponent, opt);
  }

  getPluralize() {
    if (this.frequency === 'Daily') {
      return this.count === 1 ? 'Day' : 'Days';
    }

    if (this.frequency === 'Weekly') {
      return this.count === 1 ? 'Week' : 'Weeks';
    }

    if (this.frequency === 'Bi-Weekly') {
      return this.count === 1 ? 'Bi-Weekly' : 'Bi-Weeklies';
    }

    if (this.frequency === 'Monthly') {
      return this.count === 1 ? 'Month' : 'Months';
    }

    if (this.frequency === 'Annually') {
      return this.count === 1 ? 'Year' : 'Years';
    }

    return this.frequency;
  }
}
