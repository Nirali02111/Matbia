import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DonorTokenAPIService } from '@services/API/donor-token-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-cancel-token-popup',
  templateUrl: './cancel-token-popup.component.html',
  styleUrl: './cancel-token-popup.component.scss',
  imports: [SharedModule, InputErrorComponent],
})
export class CancelTokenPopupComponent {
  @Input({ required: true }) tokenIds: number[] = [];

  @Input({ required: true }) totalAmount: number = 0;

  @Output() refresh = new EventEmitter();

  @ViewChild('cancelSubmitTokenModal') cancelSubmitTokenModal!: any;

  modalOptions?: NgbModalOptions;

  tokenForm!: FormGroup;

  reasons: string = '';

  get Reason() {
    return this.tokenForm.get('reason');
  }

  constructor(
    private modalService: NgbModal,
    private donorTokenAPI: DonorTokenAPIService,
    private localStorageData: LocalStorageDataService,
    private notification: NotificationService,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.tokenForm = this.formBuilder.group({
      reason: this.formBuilder.control(null, Validators.compose([Validators.required])),
    });
  }

  close(modal: NgbModalRef) {
    modal.close();
  }

  SubmitTokenVoidRequest() {
    if (this.tokenForm.invalid) {
      this.tokenForm.markAllAsTouched();
      return;
    }

    this.reasons = '';
    this.donorTokenAPI
      .SubmitTokenVoidRequest({
        userHandle: this.localStorageData.getLoginUserUserName(),
        tokenIds: this.tokenIds,
        cancelReason: this.Reason?.value,
      })
      .subscribe(
        (res) => {
          if (res) {
            this.closePopup();
            this.reasons = this.Reason?.value;
            this.cancelSubmitModal();
          }
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  cancelSubmitModal() {
    const option: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
    };

    this.modalService.open(this.cancelSubmitTokenModal, option);
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
