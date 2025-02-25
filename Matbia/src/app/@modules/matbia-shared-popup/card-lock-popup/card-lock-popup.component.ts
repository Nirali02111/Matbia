import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-card-lock-popup',
  templateUrl: './card-lock-popup.component.html',
  styleUrls: ['./card-lock-popup.component.scss'],
  imports: [SharedModule],
})
export class CardLockPopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  onClose() {
    this.activeModal.close();
  }
}
