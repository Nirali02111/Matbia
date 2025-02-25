import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationAPIService } from '@services/API/integration-api.service';

import { PanelPopupsService } from '../../../popups/panel-popups.service';
import { IntigrationLoaderPopupComponent } from '../intigration-loader-popup/intigration-loader-popup.component';
import { LearnMorePopupComponent } from '../learn-more-popup/learn-more-popup.component';
import { IntegratingPopupComponent } from '../integrating-popup/integrating-popup.component';
import { MerchantObj } from 'src/app/models/common-api-model';

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-integrating-account-popup',
  templateUrl: './integrating-account-popup.component.html',
  styleUrls: ['./integrating-account-popup.component.scss'],
  imports: [SharedModule, InputErrorComponent],
})
export class IntegratingAccountPopupComponent implements OnInit {
  formGroup!: FormGroup;

  @Input() accountNum!: number | string;

  @Input() merchantObj!: MerchantObj;

  @Output() reOpen = new EventEmitter();

  get AccountNumber() {
    return this.formGroup.get('accountNum');
  }

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private popupService: PanelPopupsService,
    private integrationAPI: IntegrationAPIService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      accountNum: this.fb.control(this.accountNum ? this.accountNum : null, Validators.compose([Validators.required])),
    });
  }

  closePopup() {
    this.activeModal.close();
  }

  learnMore() {
    return this.popupService.open(LearnMorePopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-batch-close modal-learn-more',
      size: 'md',
      scrollable: true,
    });
  }

  onValidate() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.closePopup();

    const loadingModalRef = this.integratingLoader();

    this.integrationAPI.getValidateAccountNumber(this.AccountNumber?.value).subscribe(
      (res) => {
        loadingModalRef.close();

        const modalRef = this.clickIntegrating();
        modalRef.componentInstance.accountNum = this.AccountNumber?.value;
        modalRef.componentInstance.merchantObj = this.merchantObj;
        const haveMatch = res && res.merchantId;

        modalRef.componentInstance.merchantId = haveMatch ? res.merchantId : null;
        modalRef.componentInstance.haveError = !haveMatch ? true : false;

        modalRef.componentInstance.goBack.subscribe(() => {
          this.reOpen.emit({
            merchantObj: this.merchantObj,
            accountNum: this.AccountNumber?.value,
          });
        });
      },
      () => {
        loadingModalRef.close();
        const modalRef = this.clickIntegrating();
        modalRef.componentInstance.haveError = true;
        modalRef.componentInstance.goBack.subscribe(() => {
          this.reOpen.emit({
            merchantObj: this.merchantObj,
            accountNum: this.AccountNumber?.value,
          });
        });
      }
    );
  }

  private integratingLoader() {
    return this.popupService.open(IntigrationLoaderPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-batch-close modal-integrate-success',
      size: 'md',
      scrollable: true,
    });
  }

  clickIntegrating() {
    return this.popupService.open(IntegratingPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-batch-close',
      size: 'md',
      scrollable: true,
    });
  }
}
