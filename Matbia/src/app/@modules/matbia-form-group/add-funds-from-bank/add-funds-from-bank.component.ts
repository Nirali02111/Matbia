import {
  Input,
  OnInit,
  Output,
  ViewChild,
  Component,
  EventEmitter,
  AfterViewInit,
  AfterContentInit,
  ChangeDetectorRef,
} from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import moment from 'moment';
import dayjs from 'dayjs';
import { Assets } from '@enum/Assets';
import { BankAccountFundingStatus } from '@enum/BankAccount';
import { CustomValidator } from '@commons/custom-validator';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import { DonorAPIService, DonorBalanceResponse, DonorGetResponse } from '@services/API/donor-api.service';
import { DepositPayload, DonatePayload } from '@services/API/donor-transaction-api.service';
import { OrganizationAPIService, OrgObj } from '@services/API/organization-api.service';
import { AddBalanceConfirmPopupComponent } from '../popups/add-balance-confirm-popup/add-balance-confirm-popup.component';
import { RecurringFormGroupComponent } from '../recurring-form-group/recurring-form-group.component';
import { ActivatedRoute } from '@angular/router';

interface ImmediateFunding {
  immediateFundingSection?: boolean;
  bothTokenMissing?: boolean;
  isImmediateFunding?: boolean;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { TransactionNoteFormGroupComponent } from '../transaction-note-form-group/transaction-note-form-group.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-add-funds-from-bank',
  templateUrl: './add-funds-from-bank.component.html',
  styleUrls: ['./add-funds-from-bank.component.scss'],
  imports: [
    SharedModule,
    RecurringFormGroupComponent,
    InputErrorComponent,
    TransactionNoteFormGroupComponent,
    AmountInputComponent,
  ],
})
export class AddFundsFromBankComponent implements OnInit, AfterContentInit, AfterViewInit {
  isAccountListLoading = false;
  isBalanceDetailsLoading = false;
  immediateFundingSection = false;
  bothTokenMissing = false;
  addressFieldsValues: string = '';
  isShulKiosk = false;
  isBlockBankManagement = false;

  profileIcon = Assets.PROFILE_IMAGE;

  @ViewChild(AmountInputComponent, { static: false }) amountInput!: AmountInputComponent;

  @ViewChild(RecurringFormGroupComponent, { static: false }) recurringComponent!: RecurringFormGroupComponent;

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;

  @ViewChild('relinkContentModal') relinkContentModal: any;

  public previewList: Array<{ date: string; amount: any }> = [];

  linkedAccountList: Array<BankAccount> = [];

  @Input() organization!: OrgObj;

  balanceDetails!: DonorBalanceResponse;
  donorObj!: DonorGetResponse;

  @Input() formGroup!: UntypedFormGroup;

  /**
   * only for donation
   *
   */
  @Input() orgId!: string;

  /**
   * only for donation Request
   */
  @Input() collector = '';

  /**
   * if Component is used from outside portal
   */
  @Input() inFlow = false;

  @Input() showAlwaysRecurringOption = true;

  @Output() bankAccountListLoaded = new EventEmitter();

  @Output() autoDepositsClicked = new EventEmitter();

  @Output() orgSuggestionClicked = new EventEmitter();

  @Input() campaignName: any = '';

  refNum: any = null;
  get Recurring() {
    return this.formGroup.get('isRecurring');
  }

  get IsDonate() {
    return this.formGroup.get('isDonate');
  }

  get UserHandle() {
    return this.formGroup.get('userHandle');
  }

  get Amount() {
    return this.formGroup.get('amount');
  }

  get TransDate() {
    return this.formGroup.get('transDate');
  }

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }

  get IsImmediateFunding() {
    return this.formGroup.get('isImmediateFunding');
  }

  get AmountDigit() {
    return !this.IsDonate?.value ? '10000000000' : '10000';
  }

  get displayName(): string {
    return this.localStorageDataService.getLoginUserFullName() || '';
  }

  get displayBusinessName(): string {
    return this.localStorageDataService.getLoginUserBusinessName() || '';
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private pageRoutes: PageRouteVariable,
    private localStorageDataService: LocalStorageDataService,
    private accountAPI: AccountAPIService,
    private organizationAPI: OrganizationAPIService,
    private matbiaDonorAPI: DonorAPIService,
    private matbiaObserver: MatbiaObserverService,
    private route: ActivatedRoute,
    private pageRoute: PageRouteVariable
  ) {}

  ngOnInit(): void {
    if (!this.organization) {
      this.getOrganizationDetails();
    }

    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      this.isShulKiosk = val;
    });

    this.route.queryParams.subscribe((params) => {
      if (params['refNum']) {
        this.refNum = params['refNum'];
      }
    });

    this.TransDate?.valueChanges.subscribe((newValue) => {
      const startDate = newValue.startDate;
      const selectedDate = new Date(startDate);
      const currentDate = new Date();

      let isFutureDate = selectedDate > currentDate;

      let validators = [Validators.required, CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true)];

      if (!isFutureDate && this.balanceDetails?.availableBalanceInclFunding) {
        validators.push(
          CustomValidator.lessThan(this.balanceDetails.availableBalanceInclFunding || 0, true, 'Not enough funds', true)
        );
      }

      this.Amount?.setValidators(Validators.compose(validators));
      this.Amount?.updateValueAndValidity();
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

    /**
     * is for donation then get Organization details
     */
    if (this.IsDonate?.value) {
      this.getBalanceDetails();
    } else {
      this.getDonorInfo();
      this.setDefaultTransactionDate();
    }

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

  ngAfterViewInit(): void {
    if (this.amountInput) {
      this.amountInput.doFocus();
    }
  }

  ngOnChanges() {
    if (
      this.organization?.mailing?.address &&
      this.organization?.mailing?.city &&
      this.organization?.mailing?.state &&
      this.organization?.mailing?.zip
    )
      this.addressFieldsValues = `${this.organization?.mailing?.address}, ${this.organization?.mailing?.city}, ${this.organization?.mailing?.state}, ${this.organization?.mailing?.zip}`;
    else this.addressFieldsValues = this.organization?.address ?? '';
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  isInvalidDate(date: dayjs.Dayjs) {
    return date.isBefore(dayjs().subtract(1, 'day'));
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

    this.formGroup.updateValueAndValidity();
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoutes.getLinkNewAccountRouterLink();
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

  getOrganizationDetails() {
    this.organizationAPI.getOrganizationById(this.orgId).subscribe(
      (res) => {
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
    this.matbiaDonorAPI.getBalance().subscribe(
      (res) => {
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

  getDonorInfo() {
    this.matbiaDonorAPI.get(this.UserHandle?.value).subscribe(
      (res) => {
        if (res) {
          this.donorObj = res;
        }
      },
      () => {}
    );
  }

  // Data Display
  displayDonorName(): string {
    return `${this.donorObj?.firstName} ${this.donorObj?.lastName}`;
  }

  emailId() {
    return this.localStorageDataService.getLoginUserEmail() || '';
  }

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  displayOrgDetails(): string {
    if (this.IsDonate?.value) {
      return this.organization?.doingBusinessAs;
    }

    if (this.localStorageDataService.isBusiness()) {
      return this.localStorageDataService.getLoginUserUserName();
    }

    return `${this.donorObj?.firstName} ${this.donorObj?.lastName}`;
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

  finalDonationValues(): DonatePayload {
    const value = this.formGroup.value;

    const transDate = value.transDate?.startDate;
    let apiData: any = {
      donorHandle: value.userHandle,
      amount: +value.amount,
      transDate: transDate,
      orgId: this.orgId,
      note: value.note,
    };

    if (this.refNum) {
      apiData.redonateRefNum = this.refNum;
    }

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

  getFinalValues() {
    if (this.IsDonate?.value) {
      return this.finalDonationValues();
    }

    return this.finalDepositValues();
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
      fullscreen: 'md',
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

    return modalRef;
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

  openDatepicker() {
    this.pickerDirective.open();
  }

  onOrgSuggestionClick() {
    this.orgSuggestionClicked.emit(this.orgId);
  }
}
