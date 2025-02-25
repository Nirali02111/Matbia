import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-after-card-confirm-popup',
  templateUrl: './after-card-confirm-popup.component.html',
  styleUrls: ['./after-card-confirm-popup.component.scss'],
  imports: [SharedModule],
})
export class AfterCardConfirmPopupComponent implements OnInit {
  @Output() emtCardConfirm: EventEmitter<any> = new EventEmitter();
  @Input() amount = 0;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
  closePopup() {
    this.activeModal.dismiss();
    this.emtCardConfirm.emit(true);
  }
}
