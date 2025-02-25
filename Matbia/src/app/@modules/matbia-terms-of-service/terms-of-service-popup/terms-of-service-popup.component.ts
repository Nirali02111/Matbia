import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-terms-of-service-popup',
  templateUrl: './terms-of-service-popup.component.html',
  styleUrls: ['./terms-of-service-popup.component.scss'],
  imports: [SharedModule],
})
export class TermsOfServicePopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.dismiss();
  }
}
