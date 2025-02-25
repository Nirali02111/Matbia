import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PanelPopupsService } from '../../../popups/panel-popups.service';
import { IntegratingAccountPopupComponent } from '../integrating-account-popup/integrating-account-popup.component';
import { IntegrationAPIService } from '@services/API/integration-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@commons/notification.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-use-midpopup',
  templateUrl: './use-midpopup.component.html',
  styleUrls: ['./use-midpopup.component.scss'],
  imports: [SharedModule, InputErrorComponent],
})
export class UseMIDPopupComponent implements OnInit {
  formGroup!: FormGroup;

  get MIDNumber() {
    return this.formGroup.get('midNum');
  }

  get AnotherMidNum() {
    return this.formGroup.get('anotherMidNum');
  }

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private notification: NotificationService,
    private popupService: PanelPopupsService,
    private integrationAPI: IntegrationAPIService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      midNum: this.fb.control(null, Validators.compose([Validators.required])),
      anotherMidNum: this.fb.control(null, Validators.compose([])),
    });
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.notification.initLoadingPopup();
    this.closePopup();

    const midNum = this.AnotherMidNum?.value
      ? `${this.MIDNumber?.value},${this.AnotherMidNum?.value}`
      : this.MIDNumber?.value;

    this.integrationAPI
      .integrate({
        midNum: midNum,
      })
      .subscribe(
        () => {
          this.notification.hideLoader();
        },
        () => {
          this.notification.throwError('Invalid MID number, please try again.');
        }
      );
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  clearValue() {
    this.MIDNumber?.patchValue(null);
    this.formGroup.updateValueAndValidity();
  }

  clickIntegratingAccount() {
    this.closePopup();
    this.openAccountPopup();
  }

  private openAccountPopup(accountNum = null) {
    const modalRef = this.popupService.open(IntegratingAccountPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-integration',
      size: 'lg',
      scrollable: true,
    });

    modalRef.componentInstance.accountNum = accountNum;
    modalRef.componentInstance.reOpen.subscribe((obj: any) => {
      this.openAccountPopup(obj.accountNum);
    });
  }
}
