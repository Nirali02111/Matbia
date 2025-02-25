import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PanelPopupsService } from '../../../popups/panel-popups.service';
import { IntegratingSuccessPopupComponent } from '../integrating-success-popup/integrating-success-popup.component';
import { IntegrationAPIService } from '@services/API/integration-api.service';
import { MerchantObj } from 'src/app/models/common-api-model';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-integrating-popup',
  templateUrl: './integrating-popup.component.html',
  styleUrls: ['./integrating-popup.component.scss'],
  imports: [SharedModule],
})
export class IntegratingPopupComponent {
  @Input() accountNum!: number | string;

  @Input() merchantId!: number;

  @Input() merchantObj!: MerchantObj;

  @Input() haveError = false;

  @Output() goBack = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    private popupService: PanelPopupsService,
    private integrationAPI: IntegrationAPIService
  ) {}

  closePopup() {
    this.activeModal.dismiss();
  }

  onIntegrate() {
    this.integrationAPI
      .integrate({
        accountNum: this.accountNum,
      })
      .subscribe(
        () => {
          this.clickIntegratingSuccess();
        },
        () => {
          this.closePopup();
        }
      );
  }

  goToBack() {
    this.closePopup();
    this.goBack.emit(true);
  }

  clickIntegratingSuccess() {
    this.closePopup();
    const modalRef = this.popupService.open(IntegratingSuccessPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-batch-close modal-integrate-success',
      size: 'md',
      scrollable: true,
    });

    modalRef.componentInstance.merchantObj = this.merchantObj;
  }
}
