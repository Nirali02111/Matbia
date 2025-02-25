import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-small-deposit-popup',
  templateUrl: './small-deposit-popup.component.html',
  styleUrls: ['./small-deposit-popup.component.scss'],
  imports: [SharedModule],
})
export class SmallDepositPopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  onClose() {
    this.activeModal.close();
  }
}
