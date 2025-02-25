import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntegratingPopupComponent } from '../integrating-popup/integrating-popup.component';
import { PanelPopupsService } from '../../../popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-intigration-loader-popup',
  templateUrl: './intigration-loader-popup.component.html',
  styleUrls: ['./intigration-loader-popup.component.scss'],
  imports: [SharedModule],
})
export class IntigrationLoaderPopupComponent {
  constructor(public activeModal: NgbActiveModal, private popupService: PanelPopupsService) {}

  closePopup() {
    this.activeModal.dismiss();
  }
}
