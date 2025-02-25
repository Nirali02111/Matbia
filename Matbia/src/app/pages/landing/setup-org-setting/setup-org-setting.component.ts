import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgbCollapse, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import moment from 'moment';

import { Params } from '@enum/Params';

import { shakeTrigger } from '@commons/animations';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { CommonDataService } from '@commons/common-data-service.service';

import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { PlaidButtonComponent } from '@matbia/plaid-link-button/plaid-button/plaid-button.component';
import { AddFundsFromBankComponent } from '@matbia/matbia-form-group/add-funds-from-bank/add-funds-from-bank.component';
import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { LinkViaRoutingPopupComponent } from '@matbia/matbia-shared-popup/link-via-routing-popup/link-via-routing-popup.component';
import { ProcessWithdrawFundConfirmPopupComponent } from '@matbia/matbia-shared-popup/process-withdraw-fund-confirm-popup/process-withdraw-fund-confirm-popup.component';
import { RedeemFundsFormGroupComponent } from '@matbia/matbia-form-group/redeem-funds-form-group/redeem-funds-form-group.component';
import { AfterWithdrawFundConfirmPopupComponent } from '@matbia/matbia-shared-popup/after-withdraw-fund-confirm-popup/after-withdraw-fund-confirm-popup.component';

import { DonorAPIService } from '@services/API/donor-api.service';
import { PlaidSuccessMetadata } from '@services/ngx-plaid-link.service';
import { OrganizationAPIService } from '@services/API/organization-api.service';
import { OrganizationTransactionAPIService } from '@services/API/organization-transaction-api.service';
import { AutomaticTransfersPopupComponent } from '@matbia/matbia-shared-popup/automatic-transfers-popup/automatic-transfers-popup.component';

import { SharedModule } from '@matbia/shared/shared.module';
import { ConnectToBankAccountComponent } from '@matbia/matbia-form-group/connect-to-bank-account/connect-to-bank-account.component';

@Component({
  selector: 'app-setup-org-setting',
  templateUrl: './setup-org-setting.component.html',
  imports: [SharedModule, PlaidButtonComponent, ConnectToBankAccountComponent],
  animations: [shakeTrigger],
})
export class SetupOrgSettingComponent implements OnInit, AfterViewInit {
  @ViewChild('addFund', { static: false }) addFundComponent!: AddFundsFromBankComponent;

  isLoading = false;
  isShulkiosk = false;
  isBlockPlaid = false;
  isLoadingConnect = false;
  isAnimate = false;

  isInLinking = false;

  userHandleControl!: UntypedFormControl;
  setupAccountForm!: UntypedFormGroup;
  redeemFormGroup!: UntypedFormGroup;

  matbiaAddFundForm!: UntypedFormGroup;
  active = 1;

  matbiaCardSubmitButton = false;

  modalOptions?: NgbModalOptions;

  isSetupCardDone = true;
  isConnectBankDone = false;

  get userHandle() {
    return this.userHandleControl;
  }

  get nameRegisterWithBank() {
    return this.setupAccountForm.get('nameRegisterWithBank');
  }

  get FirstName() {
    return this.nameRegisterWithBank?.get('firstName');
  }

  get LastName() {
    return this.nameRegisterWithBank?.get('lastName');
  }

  get linkWith() {
    return this.setupAccountForm?.get('linkWith');
  }

  get haveUsernameAndPAssword() {
    return this.linkWith?.get('haveUsernameAndPAssword');
  }

  get confirmName() {
    return this.nameRegisterWithBank?.get('confirmName');
  }

  get isAgree() {
    return this.linkWith?.get('isAgree');
  }

  @ViewChild(PlaidButtonComponent) plaidLinkButton!: PlaidButtonComponent;

  @ViewChild(RedeemFundsFormGroupComponent) redeemFormGroupComponent!: RedeemFundsFormGroupComponent;

  public isCollapsed = true;

  @ViewChild('manuallyLinkBankTemplate') manuallyLinkBankTemplate!: NgbCollapse;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    protected title: Title,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,

    private notification: NotificationService,
    private localStorageService: LocalStorageDataService,
    private commonDataService: CommonDataService,

    private matbiaFormGroupService: MatbiaFormGroupService,
    private matbiaDonorAPI: DonorAPIService,
    private orgAPIService: OrganizationAPIService,
    private orgTransactionAPI: OrganizationTransactionAPIService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Org settings');
    this.initForm();

    this.activeRoute.queryParamMap.subscribe((params) => {
      const value = params.get(Params.SHUL_KIOSK);
      if (value) {
        this.isShulkiosk = true;
      } else {
        this.isShulkiosk = false;
      }

      const blockPlaid = params.get(Params.BLOCK_PLAID);

      if (blockPlaid && this.commonDataService.isStringTrue(blockPlaid)) {
        this.isBlockPlaid = true;
      } else {
        this.isBlockPlaid = false;
      }

      const userHandle = params.get(Params.USER_HANDLE);
      if (userHandle) {
        this.userHandleControl.patchValue(userHandle);
        this.userHandleControl.updateValueAndValidity();

        this.matbiaAddFundForm.patchValue({
          userHandle,
        });
        this.matbiaAddFundForm.updateValueAndValidity();

        this.getOrganizationInfo();

        this.redeemFormGroup.patchValue({
          handle: userHandle,
        });

        this.redeemFormGroup.updateValueAndValidity();
      }
    });
  }

  ngAfterViewInit(): void {
    this.haveUsernameAndPAssword?.valueChanges.subscribe(() => {
      this.manuallyLinkBankTemplate.toggle();
    });
  }

  initForm() {
    this.userHandleControl = this.fb.control('', Validators.compose([Validators.required]));

    this.matbiaAddFundForm = this.matbiaFormGroupService.initAddFundFormGroup({
      isRecurring: false,
      isDonate: false,
      userHandle: this.userHandle?.value,
      amount: null,
      bankAccountId: null,
      transDate: moment(new Date()),
      transferNowAmount: null,
      isNotifyOnEmail: true,
      isNotifyOnSMS: false,
      recurringPayment: {
        count: null,
        amount: null,
        frequency: null,
        scheduleDate: null,
      },
    });

    this.setupAccountForm = this.fb.group({});

    this.setupAccountForm.addControl(
      'nameRegisterWithBank',
      this.fb.group({
        confirmName: this.fb.control(true, Validators.compose([Validators.required, Validators.requiredTrue])),
        firstName: this.fb.control('', Validators.compose([Validators.required])),
        lastName: this.fb.control('', Validators.compose([Validators.required])),
      })
    );

    this.setupAccountForm.addControl(
      'linkWith',
      this.fb.group({
        haveUsernameAndPAssword: this.fb.control('1'),
        isAgree: this.fb.control(false, Validators.compose([Validators.requiredTrue])),
      })
    );

    this.redeemFormGroup = this.matbiaFormGroupService.initRedeemFundsFormGroup();
  }

  // Link bank
  getOrganizationInfo() {
    this.isLoading = true;
    const orgHandle = this.localStorageService.getLoginUserUserName();
    this.orgAPIService.getOrganizationByUsername(orgHandle).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.setupAccountForm.patchValue({
            nameRegisterWithBank: {
              firstName: res.businessName,
              lastName: res.businessName,
            },
          });

          this.setupAccountForm.updateValueAndValidity();
        }
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  displayDonorFullName() {
    const firstVal = this.nameRegisterWithBank?.get('firstName')?.value;
    return `${firstVal}`;
  }

  onLinked(data: { token: string; metadata: PlaidSuccessMetadata }) {
    if (this.plaidLinkButton.checkIsManuallyAccountLink(data.metadata)) {
      this.onSkipRedeemFunds();
      return;
    }

    this.isConnectBankDone = true;
    this.localStorageService.setIsSkipBankAccountLinked();
    this.active = 2;
  }

  openLinkPopup() {
    this.isInLinking = true;
    this.modalOptions = {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'link-via-Routing-popup',
    };
    const modal = this.modalService.open(LinkViaRoutingPopupComponent, this.modalOptions);

    modal.componentInstance.userHandle = this.userHandle?.value;

    modal.componentInstance.accountName = this.displayDonorFullName();

    modal.componentInstance.linked.subscribe(() => {
      this.isConnectBankDone = true;
      this.active = 2;
    });

    modal.closed.subscribe(() => {
      this.isInLinking = false;
    });
  }

  openTerms(event: any) {
    event.preventDefault();

    if (this.isShulkiosk) {
      return;
    }

    this.modalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup',
      size: 'xl',
      scrollable: true,
    };
    this.modalService.open(TermsOfServicePopupComponent, this.modalOptions);
  }

  triggerAnimation() {
    if (this.isAnimate) {
      return;
    }

    this.isAnimate = true;
    setTimeout(() => {
      this.isAnimate = false;
    }, 1000);
  }

  commonConnectButton(eventData: { isWithPlaid: boolean }) {
    if (this.nameRegisterWithBank?.invalid) {
      this.nameRegisterWithBank?.markAllAsTouched();

      this.triggerAnimation();
      return;
    }

    if (!this.isAgree?.value) {
      this.linkWith?.markAllAsTouched();

      this.triggerAnimation();
      return;
    }

    const { confirmName, ...restData } = this.nameRegisterWithBank?.value;

    let bodyData = { ...restData, userHandle: this.userHandle.value };

    this.isLoadingConnect = true;
    this.matbiaDonorAPI.update(bodyData).subscribe(
      (res) => {
        this.isLoadingConnect = false;
        if (res) {
          if (res.errors && res.errors.length !== 0) {
            this.notification.showError(res.errors[0].error, 'Error !');
            return;
          }

          if (!eventData.isWithPlaid) {
            this.openLinkPopup();
            return;
          }

          // always open plaid
          this.plaidLinkButton.openLinkAccount();
          this.isInLinking = true;
          this.plaidLinkButton.exited.subscribe(() => {
            this.isInLinking = false;
          });
        }
      },
      (err) => {
        this.isLoadingConnect = false;
        this.notification.showError(err.error, 'Error !');
      }
    );
  }

  onRedeem() {
    if (this.redeemFormGroup.invalid) {
      this.redeemFormGroup.markAllAsTouched();

      return;
    }

    const modalRef = this.modalService.open(ProcessWithdrawFundConfirmPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'donate-popup',
      size: 'lg',
      scrollable: true,
    });

    const value = this.redeemFormGroup.value;
    let objValue = this.redeemFormGroupComponent.linkedAccountList.filter(
      (x) => x.bankAccountId == value.bankAccountId
    );
    modalRef.componentInstance.amount = +value.totalAmount;
    modalRef.componentInstance.accoNum = objValue && objValue[0].accountNumber;
    modalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (val) {
        this.doRedeemTemp();
      }
    });
  }

  private doRedeemTemp() {
    const values = this.redeemFormGroup.value;

    const apiData = {
      ...values,
      totalAmount: +values.totalAmount,
      createdBy: this.localStorageService.getLoginUserId(),
    };

    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        this.onSkipRedeemFunds();
        return;
      }
    });

    this.orgTransactionAPI.redeemTemp(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res.error[0].error);
          return;
        }

        this.notification.close();

        const modalRef = this.modalService.open(AfterWithdrawFundConfirmPopupComponent, {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'donate-popup',
          size: 'lg',
          scrollable: true,
        });

        const value = this.redeemFormGroup.value;
        let objValue = this.redeemFormGroupComponent.linkedAccountList.filter(
          (x) => x.bankAccountId == value.bankAccountId
        );
        modalRef.componentInstance.accoNum = objValue && objValue[0].accountNumber;
        modalRef.componentInstance.amount = +value.totalAmount;
        this.redeemFormGroup.get('totalAmount')?.setValue(null);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  onSetUpAutomaticTransfer() {
    this.onAutomaticTransfer();
  }

  onAutomaticTransfer() {
    const modalRef = this.modalService.open(AutomaticTransfersPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
      size: 'lg',
      windowClass: 'automatic-transfers-modal',
    });

    modalRef.componentInstance.amount = !this.redeemFormGroupComponent.isOnAutoRedeem
      ? +this.redeemFormGroupComponent.TotalAmount?.value
      : this.redeemFormGroupComponent.orgBalance.autoRedeemAmount;
    modalRef.componentInstance.availableToRedeem = this.redeemFormGroupComponent.orgBalance.availableToRedeem;

    modalRef.componentInstance.haveScheduleAutoRedeem = this.redeemFormGroupComponent.isAlreadyScheduleAutoRedeem;

    modalRef.componentInstance.isOnSchedule = this.redeemFormGroupComponent.isOnSchedule;
    modalRef.componentInstance.isOnAutoRedeem = this.redeemFormGroupComponent.isOnAutoRedeem;
    modalRef.componentInstance.selectedFrequency = this.redeemFormGroupComponent.orgBalance.recurrenceId;

    if (this.redeemFormGroupComponent.isOnSchedule) {
      if (this.redeemFormGroupComponent.autoTransferData.recurringPayment.frequency === 2) {
        modalRef.componentInstance.selectedDay = +moment(
          this.redeemFormGroupComponent.orgBalance.scheduleDateTime
        ).format('d');
      }

      if (this.redeemFormGroupComponent.autoTransferData.recurringPayment.frequency === 4) {
        modalRef.componentInstance.selectedDate =
          this.redeemFormGroupComponent.autoTransferData.recurringPayment.scheduleDate;
      }
    }

    modalRef.componentInstance.emtOnRedeemSchedule.subscribe((obj: any) => {
      this.redeemFormGroupComponent.autoTransferData = {
        recurringPayment: {
          ...obj,
        },
      };
      this.doScheduleRedeem({
        recurringPayment: {
          ...obj,
        },
        bankAccountId: this.redeemFormGroupComponent.BankAccountId?.value,
      });
    });
  }

  private doScheduleRedeem(apiData: any) {
    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        this.onSkipRedeemFunds();
        return;
      }
    });

    this.orgTransactionAPI.scheduleRedeem(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res.error[0].error);
          return;
        }

        this.notification.displaySuccess(res);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  onSkipConnectBank() {
    this.onSkipRedeemFunds();
  }

  onSkipRedeemFunds() {
    if (!this.isConnectBankDone) {
      this.localStorageService.setIsSkipBankAccountLinked();
    }
    this.router.navigate([PageRouteVariable.DashboardUrl]);
  }
}
