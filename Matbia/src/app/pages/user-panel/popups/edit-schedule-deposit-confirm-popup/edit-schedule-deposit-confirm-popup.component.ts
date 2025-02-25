import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-edit-schedule-deposit-confirm-popup',
  templateUrl: './edit-schedule-deposit-confirm-popup.component.html',
  styleUrls: ['./edit-schedule-deposit-confirm-popup.component.scss'],
  imports: [SharedModule],
})
export class EditScheduleDepositConfirmPopupComponent {
  @Input() isDelete = false;

  @Output() confirm: EventEmitter<boolean> = new EventEmitter();

  constructor(private activeModal: NgbActiveModal) {}

  onConfirm() {
    this.confirm.emit(true);
    this.activeModal.close();
  }

  closePopup() {
    this.activeModal.close();
  }
}
