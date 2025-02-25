import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';

@Component({
  selector: 'app-process-withdraw-fund-confirm-popup',
  templateUrl: './process-withdraw-fund-confirm-popup.component.html',
  styleUrls: ['./process-withdraw-fund-confirm-popup.component.scss'],
  imports: [SharedModule, DisplayLastPipe],
})
export class ProcessWithdrawFundConfirmPopupComponent implements OnInit {
  @Input() amount = 0;

  @Input() accoNum = '';

  @Output() emtOnConfirm: EventEmitter<boolean> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.dismiss();
  }

  getUSDAmount() {
    return this.amount;
  }

  onConfirmClick() {
    this.emtOnConfirm.emit(true);
    this.closePopup();
  }
}
