import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { BankAccountFundingStatus } from '@enum/BankAccount';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import { DonorAPIService, DonorBalanceResponse, DonorGetResponse } from '@services/API/donor-api.service';
import { DepositPayload, DonatePayload } from '@services/API/donor-transaction-api.service';
import dayjs from 'dayjs';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { AddBalanceConfirmPopupComponent } from '../popups/add-balance-confirm-popup/add-balance-confirm-popup.component';
import { OrgObj, OrganizationAPIService } from '@services/API/organization-api.service';
import { RecurringFormGroupComponent } from '../recurring-form-group/recurring-form-group.component';
import { CustomValidator } from '@commons/custom-validator';
import moment from 'moment';
import { MaaserCalculatorPopupComponent } from 'src/app/pages/user-panel/popups/maaser-calculator-popup/maaser-calculator-popup.component';
interface ImmediateFunding {
  immediateFundingSection?: boolean;
  bothTokenMissing?: boolean;
  isImmediateFunding?: boolean;
}
import { SharedModule } from '@matbia/shared/shared.module';
import { AddFundsOtherMethodOptionLinksComponent } from 'src/app/pages/user-panel/add-funds/add-funds-other-method-option-links/add-funds-other-method-option-links.component';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-deposit-funds-via-bank-account',
  templateUrl: './deposit-funds-via-bank-account.component.html',
  styleUrl: './deposit-funds-via-bank-account.component.scss',
  imports: [SharedModule, AddFundsOtherMethodOptionLinksComponent, AmountInputComponent, InputErrorComponent],
})
export class DepositFundsViaBankAccountComponent {
  @Input() formGroup!: UntypedFormGroup;

  @Input() inFlow = false;

  @Output() bankAccountListLoaded = new EventEmitter();

  @Output() autoDepositsContinueClicked = new EventEmitter();

  @Output() chooseOtherOptions = new EventEmitter();

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;

  @ViewChild(RecurringFormGroupComponent, { static: false }) recurringComponent!: RecurringFormGroupComponent;

  @ViewChild('relinkContentModal') relinkContentModal: any;

  @Input() orgId!: string;

  organization!: OrgObj;
  linkedAccountList: Array<BankAccount> = [];
  isAccountListLoading = false;
  isShulKiosk = false;
  isBlockBankManagement = false;
  donorObj!: DonorGetResponse;

  immediateFundingSection = false;
  bothTokenMissing = false;
  balanceDetails!: DonorBalanceResponse;
  isBalanceDetailsLoading = false;
  availableBalance: number | undefined;
  isLoading: boolean = false;

  get IsDonate() {
    return this.formGroup.get('isDonate');
  }

  get AmountDigit() {
    return !this.IsDonate?.value ? '10000000000' : '10000';
  }

  get UserHandle() {
    return this.formGroup.get('userHandle');
  }

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }

  get IsImmediateFunding() {
    return this.formGroup.get('isImmediateFunding');
  }

  get Recurring() {
    return this.formGroup.get('isRecurring');
  }

  get TransDate() {
    return this.formGroup.get('transDate');
  }

  get Amount() {
    return this.formGroup.get('amount');
  }

  get note() {
    return this.formGroup.get('note');
  }

  constructor(
    private accountAPI: AccountAPIService,
    private pageRoutes: PageRouteVariable,
    private matbiaObserver: MatbiaObserverService,
    private localStorageDataService: LocalStorageDataService,
    private matbiaDonorAPI: DonorAPIService,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private modalService: NgbModal,
    private organizationAPI: OrganizationAPIService
  ) {}

  ngOnInit(): void {
    if (this.IsDonate?.value) {
      this.getOrganizationDetails();
      this.getBalanceDetails();
    } else {
      this.getDonorInfo();
      this.getBalance();
      this.setDefaultTransactionDate();
    }

    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      this.isShulKiosk = val;
    });

    this.matbiaObserver.blockBankManagement$.subscribe((val) => {
      this.isBlockBankManagement = val;
    });

    if (this.UserHandle?.value) {
      this.getAccountList(this.UserHandle.value);
    }

    this.UserHandle?.valueChanges.subscribe((val) => {
      if (val) {
        this.getAccountList(val);
      }
    });

    this.BankAccountId?.valueChanges.subscribe((val) => {
      const bankAccountDetails = this.linkedAccountList.find((o) => o.bankAccountId === val);
      this.IsImmediateFunding?.setValue(false);

      if (
        !!bankAccountDetails?.fundingStatus &&
        bankAccountDetails?.fundingStatus === BankAccountFundingStatus.FUNDING
      ) {
        this.immediateFundingSection = false;
        return;
      }

      if (
        !!bankAccountDetails?.fundingStatus &&
        bankAccountDetails?.fundingStatus === BankAccountFundingStatus.RELINK
      ) {
        this.relinkPopup();
        return;
      }

      if (
        !!bankAccountDetails?.fundingStatus &&
        bankAccountDetails?.fundingStatus === BankAccountFundingStatus.SWITCH
      ) {
        this.immediateFundingSection = true;
        this.bothTokenMissing = false;
        return;
      }

      this.immediateFundingSection = false;
    });
  }

  getAccountList(value: string) {
    if ((!this.linkedAccountList || this.linkedAccountList.length === 0) && !this.IsDonate?.value) {
      this.isAccountListLoading = true;
      this.accountAPI.getBankAccounts(value).subscribe(
        (res) => {
          this.isAccountListLoading = false;
          if (res && res.data && res.data.length !== 0) {
            this.linkedAccountList = res.data;

            this.bankAccountListLoaded.emit(true);
            if (this.BankAccountId?.value) {
              return;
            }

            if (res.firstAccount && res.firstAccount.bankAccountId) {
              this.BankAccountId?.patchValue(res.firstAccount.bankAccountId);
            }
          }
        },
        () => {
          this.isAccountListLoading = false;
        }
      );
    }
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoutes.getLinkNewAccountRouterLink();
  }

  getBankAccountsRouterLink() {
    return this.pageRoutes.getBankAccountsRouterLink();
  }

  displayDonorName(): string {
    return `${this.donorObj?.firstName} ${this.donorObj?.lastName}`;
  }

  getDonorInfo() {
    this.isLoading = true;
    this.matbiaDonorAPI.get(this.UserHandle?.value).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.donorObj = res;
        }
      },
      () => {}
    );
  }

  isInvalidDate(date: dayjs.Dayjs) {
    return date.isBefore(dayjs().subtract(1, 'day'));
  }

  openDatepicker() {
    this.pickerDirective.open();
  }

  goToAutoDepositsPage() {
    this.router.navigate(this.pageRoute.getAutoDepositRouterLink());
  }

  finalDepositValues(): DepositPayload & ImmediateFunding {
    const value = this.formGroup.value;

    let apiData = {
      userHandle: value.userHandle,
      amount: +value.amount,
      bankAccountId: value.bankAccountId,
      transDate: value.transDate?.startDate,
      note: value.note,

      immediateFundingSection: this.immediateFundingSection,
      bothTokenMissing: this.bothTokenMissing,
      isImmediateFunding: value.isImmediateFunding,
    };

    if (!value.isRecurring && value.transDate?.startDate.isAfter(new Date(), 'day')) {
      Object.assign(apiData, {
        transDate: null,
        recurringPayment: {
          count: 1,
          frequency: 1,
          amount: +value.amount,
          scheduleDate: value.transDate?.startDate,
        },
      });
    }

    return apiData;
  }

  relinkPopup() {
    return this.modalService.open(this.relinkContentModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'relink--popup',
      size: 'md',
      scrollable: true,
    });
  }

  onRelinkClick(modal: NgbModalRef) {
    modal.close();
  }

  finalDonationValues(): DonatePayload {
    const value = this.formGroup.value;

    const transDate = value.transDate?.startDate;

    let apiData = {
      donorHandle: value.userHandle,
      amount: +value.amount,
      transDate: transDate,
      orgId: this.orgId,
      note: value.note,
    };

    if (value.isRecurring) {
      const { isRecurring, transferNowAmount, isDonate, accountName, userHandle, bankAccountId, ...resetValues } =
        value;

      apiData = {
        ...resetValues,
        amount: resetValues.recurringPayment.alwaysRecurring ? apiData.amount : +resetValues.recurringPayment?.amount,
        transDate: transDate,
        orgId: this.orgId,
        donorHandle: value.userHandle,
        recurringPayment: {
          ...resetValues.recurringPayment,
          count: resetValues.recurringPayment.alwaysRecurring ? -1 : +resetValues.recurringPayment?.count,
          amount: resetValues.recurringPayment.alwaysRecurring ? apiData.amount : +resetValues.recurringPayment?.amount,
          scheduleDate: transDate,
        },
      };
    }

    if (!value.isRecurring && value.transDate?.startDate.isAfter(new Date(), 'day')) {
      Object.assign(apiData, {
        recurringPayment: {
          count: 1,
          frequency: 1,
          amount: +value.amount,
          scheduleDate: transDate,
        },
      });
    }

    return apiData;
  }

  displayOrgDetails(): string {
    if (this.IsDonate?.value) {
      return this.organization?.displayName;
    }

    if (this.localStorageDataService.isBusiness()) {
      return this.localStorageDataService.getLoginUserUserName();
    }

    return `${this.donorObj?.firstName} ${this.donorObj?.lastName}`;
  }

  openConfirmation(): NgbModalRef {
    const modalRef = this.modalService.open(AddBalanceConfirmPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: this.IsDonate?.value
        ? 'donate-funds-confirm-popup donate-popup modal-funds add-funds-confirm-popup'
        : 'add-funds-confirm-popup modal-funds',
      size: this.IsDonate?.value ? 'md' : 'lg',
      scrollable: true,
    });

    if (this.IsDonate?.value) {
      const finalDonationData = this.finalDonationValues();
      modalRef.componentInstance.amount = finalDonationData.amount;
      modalRef.componentInstance.organization = this.displayOrgDetails();

      modalRef.componentInstance.isDeposit = false;

      if (this.Recurring?.value) {
        modalRef.componentInstance.isRecurring = this.Recurring?.value;
        modalRef.componentInstance.frequency = this.recurringComponent.transactionRecurrences.find(
          (o) => o.id === finalDonationData.recurringPayment?.frequency
        )?.name;

        modalRef.componentInstance.count = finalDonationData.recurringPayment?.count;
        modalRef.componentInstance.totalAmount = this.recurringComponent.displayTotal();

        if (finalDonationData.recurringPayment?.count !== -1) {
          modalRef.componentInstance.startDate = this.recurringComponent.previewList[0].date;
          modalRef.componentInstance.endDate = this.recurringComponent.previewListLast[0].date;
        }

        if (finalDonationData.recurringPayment?.count === -1) {
          modalRef.componentInstance.startDate = this.recurringComponent.previewList[0].date;
          modalRef.componentInstance.endDate = null;
          modalRef.componentInstance.totalAmount = finalDonationData.amount;
        }
      }

      return modalRef;
    }

    const finalDepositData = this.finalDepositValues();

    const bankAccountDetails = this.linkedAccountList.find((o) => o.bankAccountId === finalDepositData.bankAccountId);

    modalRef.componentInstance.amount = finalDepositData.amount;
    modalRef.componentInstance.accountName = bankAccountDetails?.accountName;
    modalRef.componentInstance.accountNumber = bankAccountDetails?.accountNumber;
    modalRef.componentInstance.accountType = bankAccountDetails?.accountType;
    modalRef.componentInstance.bankName = bankAccountDetails?.bankName;

    return modalRef;
  }

  getOrganizationDetails() {
    this.isLoading = true;
    this.organizationAPI.getOrganizationById(this.orgId).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.organization = res;
        }
      },
      (err) => {
        if (err.error === 'Could not find any recognizable digits.' || err.status === 400) {
          this.organizationAPI.getOrganizationByUsername(this.orgId).subscribe((res) => {
            if (res) {
              this.organization = res;
            }
          });
        }
      }
    );
  }

  getBalanceDetails() {
    this.isBalanceDetailsLoading = true;
    this.isLoading = true;
    this.matbiaDonorAPI.getBalance().subscribe(
      (res) => {
        this.isLoading = false;
        this.isBalanceDetailsLoading = false;

        if (res) {
          this.balanceDetails = res;
          this.Amount?.clearValidators();
          this.Amount?.setValidators(
            Validators.compose([
              Validators.required,
              CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
              CustomValidator.lessThan(
                this.balanceDetails.availableBalanceInclFunding || 0,
                true,
                'Not enough funds',
                true
              ),
            ])
          );

          this.Amount?.updateValueAndValidity();
          this.formGroup.updateValueAndValidity();
        }
      },
      () => {
        this.isBalanceDetailsLoading = false;
      }
    );
  }

  setDefaultTransactionDate() {
    if (this.TransDate?.value) {
      this.formGroup.patchValue({
        transDate: {
          startDate: this.TransDate?.value,
          endDate: this.TransDate?.value,
        },
      });
    }

    if (!this.TransDate?.value) {
      this.formGroup.patchValue({
        transDate: {
          startDate: moment(new Date()),
          endDate: moment(new Date()),
        },
      });
    }
  }

  getPaypalCreditCardFundsRouterLink() {
    return this.pageRoute.getPaypalCreditCardFundsRouterLink();
  }

  getBalance() {
    this.isLoading = true;
    this.matbiaDonorAPI.getBalance().subscribe((res) => {
      this.isLoading = false;
      if (res) {
        this.availableBalance = res.availableBalanceInclFunding || 0;
      }
    });
  }

  getChooseDepositeMethodRouterLink() {
    return this.pageRoute.getChooseDepositeMethodRouterLink();
  }

  openMaaserCalculator() {
    let modalRef = this.modalService.open(MaaserCalculatorPopupComponent, {
      centered: true,
      backdrop: 'static',
      windowClass: '',
      size: 'md',
      scrollable: true,
      modalDialogClass: 'modal-calculator',
      fullscreen: 'md',
    });

    modalRef.closed.subscribe((result) => {
      this.setFormValues(result);
    });
  }

  setFormValues(result: any) {
    if (result) {
      const charityPercentage = (result: any) => {
        if (result.percentage == 10) return `Maaser (10%) = $${result.charityAmount?.toFixed(2)}`;
        else if (result.percentage == 20) return `Chomesh (20%) = $${result.charityAmount?.toFixed(2)}`;
        else return `Custom (${result.percentage}%) = $${result.charityAmount?.toFixed(2)}`;
      };

      let noteValue = `Amount: $${result.earningAmount}.\nPercentage: ${charityPercentage(result)}.\nPaid by: ${
        result.payerName
      }.\nPay period: ${result.payPeriod}.`;

      this.Amount?.setValue(result.charityAmount?.toFixed(2));
      this.note?.setValue(noteValue);

      this.Amount?.markAsTouched();
      this.Amount?.markAsDirty();
      this.Amount?.updateValueAndValidity();
    }
  }
}
