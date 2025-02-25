import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-learn-more-popup',
  templateUrl: './learn-more-popup.component.html',
  styleUrls: ['./learn-more-popup.component.scss'],
  imports: [SharedModule],
})
export class LearnMorePopupComponent {
  constructor(public activeModal: NgbActiveModal) {}

  closePopup() {
    this.activeModal.dismiss();
  }
}
