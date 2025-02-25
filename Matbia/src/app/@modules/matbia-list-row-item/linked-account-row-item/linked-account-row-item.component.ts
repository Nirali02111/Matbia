import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { shakeTrigger } from '@commons/animations';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { Assets } from '@enum/Assets';
import { BankAccountFundingStatus, BankAccountLinkStatus, BankAccountStatus } from '@enum/BankAccount';
import { PlaidButtonComponent } from '@matbia/plaid-link-button/plaid-button/plaid-button.component';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import { PanelPopupsService } from 'src/app/pages/user-panel/popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-linked-account-row-item',
  templateUrl: './linked-account-row-item.component.html',
  styleUrls: ['./linked-account-row-item.component.scss'],
  imports: [SharedModule, PlaidButtonComponent],
  animations: [shakeTrigger],
})
export class LinkedAccountRowItemComponent implements OnInit {
  showToOther = false;
  inAnimation = false;

  userHandleControl!: UntypedFormControl;

  bankAccountNickNameFormGroup!: FormGroup;

  @Input() item!: BankAccount;
  @Input() id!: string;

  @Input() bankLogoIcon = Assets.PROFILE_IMAGE;

  // when deleting account
  @Input() schedulesFromAccount!: string | null;
  @Input() schedulesToAccount!: string | null;

  @Input() primaryAccount!: string;

  @ViewChild(PlaidButtonComponent) plaidLinkButton!: PlaidButtonComponent;

  @ViewChild('bankNickNameModal') bankNickNameModal: any;

  @Output() deleted = new EventEmitter();
  @Output() selectPrimary = new EventEmitter();
  @Output() isTransferringSchedules = new EventEmitter();
  @Output() transferTo = new EventEmitter();

  @Output() reload = new EventEmitter();

  get isInactive(): boolean {
    return this.item.accountStatus === BankAccountStatus.INACTIVE;
  }

  get isActive(): boolean {
    return this.item.accountStatus === BankAccountStatus.ACTIVE;
  }

  get isRelink(): boolean {
    return this.item.fundingStatus === BankAccountFundingStatus.RELINK;
  }

  get isAvailableForDefaultAccount() {
    return (
      this.item.accountLinkStatus !== BankAccountLinkStatus.POSTED &&
      this.item.accountLinkStatus !== BankAccountLinkStatus.PENDING_MANUAL_VERIFICATION
    );
  }

  get needVerify(): boolean {
    return this.item.accountLinkStatus === BankAccountLinkStatus.POSTED;
  }

  get userHandle() {
    return this.userHandleControl;
  }

  get NickNameCtrl() {
    return this.bankAccountNickNameFormGroup.get('accountNickname');
  }

  constructor(
    private fb: UntypedFormBuilder,
    private localStorage: LocalStorageDataService,
    private accountAPI: AccountAPIService,
    private notification: NotificationService,
    private panelPopupService: PanelPopupsService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    const username = this.localStorage.getLoginUserUserName();
    this.userHandleControl = this.fb.control(username, Validators.compose([Validators.required]));

    this.bankAccountNickNameFormGroup = this.fb.group({
      bankAccountId: this.fb.control(this.id, Validators.compose([Validators.required])),
      accountNickname: this.fb.control(this.item.accountNickName, Validators.compose([Validators.required])),
    });
  }

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  deleteAction() {
    const modalRef = this.panelPopupService.openDeleteBankAccountConfirm();
    modalRef.componentInstance.accountName = this.item.accountName;
    modalRef.componentInstance.accountNumber = this.item.accountNumber;
    modalRef.componentInstance.accountType = this.item.accountType;

    modalRef.componentInstance.proceed.subscribe((val: boolean) => {
      if (val) {
        this.doDelete();
      }
    });

    modalRef.componentInstance.schedulesToOther.subscribe((val: boolean) => {
      if (val) {
        this.isTransferringSchedules.emit(this.id);
      }
    });
  }

  handleChange(evt: any) {
    const target = evt.target;
    if (target.checked) {
      this.selectPrimary.emit(this.id);
    }
  }

  handleScheduleChange(evt: any) {
    const target = evt.target;
    if (target.checked) {
      this.transferTo.emit(this.id);
    }
  }

  onPlaidVerify() {
    if (!this.item.accessToken) {
      this.notification.showError('No link token');
      return;
    }

    this.plaidLinkButton.openLinkAccount();
  }

  onLinked() {
    this.reload.emit();
  }

  private doDelete() {
    const loginId = this.localStorage.getLoginUserId();
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.deleted.emit(this.id);
        return;
      }
    });

    this.accountAPI.deleteBankAccount(this.id, loginId).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.errors && res.errors.length !== 0) {
          this.notification.displayError(res.errors[0].error);
          return;
        }

        this.notification.displaySuccess(res.message);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  onEditNickName() {
    this.bankAccountNickNameFormGroup.patchValue({
      accountNickname: this.item.accountNickName,
    });

    this.panelPopupService.open(this.bankNickNameModal, {
      centered: true,
      keyboard: false,
      windowClass: 'bank-account-set-nickname-pop',
    });
  }

  onSubmitNickname(modal: any) {
    if (this.bankAccountNickNameFormGroup.invalid) {
      this.bankAccountNickNameFormGroup.markAllAsTouched();
      this.triggerAnimation();
      return;
    }
    modal.dismiss();

    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.reload.emit();
        return;
      }
    });

    const loginId = this.localStorage.getLoginUserId();
    this.accountAPI
      .update({
        ...this.bankAccountNickNameFormGroup.value,
        updateBy: loginId,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();

          this.notification.displaySuccess(res);
        },
        () => {
          this.notification.hideLoader();
        }
      );
  }
}
