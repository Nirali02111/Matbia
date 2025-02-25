import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DonorTokenAPIService } from '@services/API/donor-token-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-token-sms-popup',
  templateUrl: './token-sms-popup.component.html',
  styleUrls: ['./token-sms-popup.component.scss'],
  imports: [SharedModule, PhoneInputComponent, InputErrorComponent],
})
export class TokenSmsPopupComponent {
  @Input() tokenNum!: string;

  @Input() tokenAmt: number = 0;

  @Input() tokenId: number = 0;

  @Output() refresh = new EventEmitter();

  @ViewChild('confirmShareTokenSMS') confirmShareTokenSmsModal!: any;
  @ViewChild('tokenShared') tokenSharedModal!: any;

  tokenForm!: FormGroup;
  isSubmitted: boolean = false;

  get PhoneNumber() {
    return this.tokenForm.get('phoneNumber');
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
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      note: ['', [Validators.maxLength(255)]],
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  close(modal: NgbModalRef) {
    modal.close();
  }

  confirmTokenSMS() {
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

    this.modalService.open(this.confirmShareTokenSmsModal, option);
  }

  tokenShareSMS() {
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

  sendSMS(modal: NgbModalRef) {
    this.donorTokenAPIService
      .sendSMS({
        userHandle: this.localStorageData.getLoginUserUserName(),
        phone: this.PhoneNumber?.value,
        note: this.Note?.value,
        tokenIds: [this.tokenId],
      })
      .subscribe(
        () => {
          this.closePopup();
          modal.close();
          this.tokenShareSMS();
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }
}
