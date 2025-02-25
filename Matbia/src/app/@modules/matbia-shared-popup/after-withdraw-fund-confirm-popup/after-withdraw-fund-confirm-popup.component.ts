import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';

@Component({
  selector: 'app-after-withdraw-fund-confirm-popup',
  templateUrl: './after-withdraw-fund-confirm-popup.component.html',
  styleUrls: ['./after-withdraw-fund-confirm-popup.component.scss'],
  imports: [SharedModule, DisplayLastPipe],
})
export class AfterWithdrawFundConfirmPopupComponent implements OnInit {
  constructor(private activeModal: NgbActiveModal) {}
  @Input() amount = 0;
  @Input() accoNum = '';

  @Input() isBatch = false;

  ngOnInit(): void {}
  closePopup() {
    this.activeModal.dismiss();
  }

  getUSDAmount() {
    return this.amount;
  }

  onConfirmClick() {
    this.closePopup();
  }
}
