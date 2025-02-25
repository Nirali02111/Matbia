import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DonorTokenAPIService } from '@services/API/donor-token-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-token-email-popup',
  templateUrl: './token-email-popup.component.html',
  styleUrls: ['./token-email-popup.component.scss'],
  imports: [SharedModule, InputErrorComponent],
})
export class TokenEmailPopupComponent {
  @Input() tokenNum!: string;

  @Input() tokenAmt: number = 0;

  @Input() tokenId: number = 0;

  @Output() refresh = new EventEmitter();

  @ViewChild('confirmShareTokenEmail') confirmShareTokenEmailModal!: any;
  @ViewChild('tokenShared') tokenSharedModal!: any;

  tokenForm!: FormGroup;
  isSubmitted: boolean = false;

  get Email() {
    return this.tokenForm.get('email');
  }

  get Note() {
    return this.tokenForm.get('note');
  }

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private donorTokenAPIService: DonorTokenAPIService,
    private notification: NotificationService,
    private localStorageData: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.tokenForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      note: ['', [Validators.maxLength(255)]],
    });
  }

  confirmTokenEmail() {
    if (this.tokenForm.invalid) {
      this.isSubmitted = true;
      return;
    }

    const option: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
    };

    this.modalService.open(this.confirmShareTokenEmailModal, option);
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  sendEmail(modal: NgbModalRef) {
    this.donorTokenAPIService
      .sendEmail({
        userHandle: this.localStorageData.getLoginUserUserName(),
        email: this.Email?.value,
        note: this.Note?.value,
        tokenIds: [this.tokenId],
      })
      .subscribe(
        () => {
          this.closePopup();
          modal.close();
          this.tokenShareEmail();
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  close(modal: NgbModalRef) {
    modal.close();
  }

  tokenShareEmail() {
    const option: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
    };

    this.modalService.open(this.tokenSharedModal, option);
  }
}
