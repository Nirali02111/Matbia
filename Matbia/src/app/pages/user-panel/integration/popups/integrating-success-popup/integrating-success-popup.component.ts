import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PanelPopupsService } from '../../../popups/panel-popups.service';
import { MerchantObj } from 'src/app/models/common-api-model';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-integrating-success-popup',
  templateUrl: './integrating-success-popup.component.html',
  styleUrls: ['./integrating-success-popup.component.scss'],
  imports: [SharedModule],
})
export class IntegratingSuccessPopupComponent {
  @Input() merchantObj!: MerchantObj;

  constructor(public activeModal: NgbActiveModal, private popupService: PanelPopupsService) {}

  closePopup() {
    this.activeModal.close();
  }
}
