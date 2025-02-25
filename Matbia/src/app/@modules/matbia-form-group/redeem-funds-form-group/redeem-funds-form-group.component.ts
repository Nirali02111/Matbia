import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import moment from 'moment';

import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { BankAccountFundingStatus } from '@enum/BankAccount';
import { CustomValidator } from '@commons/custom-validator';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { ScheduleAPIService } from '@services/API/schedule-api.service';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import {
  OrganizationAPIService,
  OrgBalanceResponse,
  OrgTransactionFeeResponse,
} from '@services/API/organization-api.service';

interface AutoTransferModel {
  recurringPayment: {
    frequency: number | null;
    amount: any;
    scheduleDate: any;
    selectedDay: any;
  };
}

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-redeem-funds-form-group',
  templateUrl: './redeem-funds-form-group.component.html',
  styleUrls: ['./redeem-funds-form-group.component.scss'],
  imports: [SharedModule, AmountInputComponent, InputErrorComponent],
})
export class RedeemFundsFormGroupComponent implements OnInit, AfterContentInit, AfterViewInit {
  isLoading = false;

  isAccountListLoading = false;

  linkedAccountList: Array<BankAccount & { disabled?: boolean }> = [];

  orgBalance!: OrgBalanceResponse & { availableToRedeem?: number };

  orgFee!: OrgTransactionFeeResponse;

  autoTransferData: AutoTransferModel = {
    recurringPayment: {
      frequency: null,
      amount: null,
      scheduleDate: null,
      selectedDay: null,
    },
  };

  isOnAutoRedeem = false;
  isOnSchedule = false;

  @Input() formGroup!: UntypedFormGroup;

  @Output() noBankAccountLinked: EventEmitter<boolean> = new EventEmitter();

  @Output() setupAutomaticTransfer: EventEmitter<boolean> = new EventEmitter();

  @Output() needRelink: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(AmountInputComponent, { static: false }) amountInput!: AmountInputComponent;

  @ViewChild('relinkContentModal', { static: false }) relinkContentModal!: AmountInputComponent;

  get Handle() {
    return this.formGroup.get('handle');
  }

  get TotalAmount() {
    return this.formGroup.get('totalAmount');
  }

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }

  get IsSchedule() {
    return this.formGroup.get('isSchedule');
  }

  get CalculatedFees() {
    if (this.orgFee && this.orgFee.fee) {
      return this.orgFee.fee;
    }

    return 0;
  }

  get DepositAmount() {
    if (!this.TotalAmount?.value) {
      return 0;
    }

    const value = +this.TotalAmount.value;
    if (this.orgFee && this.orgFee.fee) {
      return value - this.orgFee.fee;
    }

    return 0;
  }

  get isAlreadyScheduleAutoRedeem() {
    return this.isOnSchedule || this.isOnAutoRedeem;
  }

  constructor(
    private router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private pageRoute: PageRouteVariable,
    private accountAPI: AccountAPIService,
    private organizationAPI: OrganizationAPIService,
    private scheduleAPI: ScheduleAPIService,
    private notification: NotificationService,
    private localStorageService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.getBalance();
    this.getBankAccountList();

    this.TotalAmount?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((formValue) => {
          if (!formValue || this.TotalAmount?.invalid) {
            return of({
              availableBalance: 0,
              fee: 0,
              feePercentage: 0,
            });
          }

          return this.organizationAPI.getTransactionFee(+formValue).pipe(
            catchError(() => {
              return of({
                availableBalance: 0,
                fee: 0,
                feePercentage: 0,
              });
            })
          );
        }),
        map((data) => data)
      )
      .subscribe((val) => {
        this.orgFee = val;
      });

    this.BankAccountId?.valueChanges.subscribe((val) => {
      const bankAccountDetails = this.linkedAccountList.find((o) => o.bankAccountId === val);

      if (
        !!bankAccountDetails?.fundingStatus &&
        bankAccountDetails?.fundingStatus === BankAccountFundingStatus.RELINK
      ) {
        this.needRelink.emit(true);
        return;
      }
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.amountInput) {
      this.amountInput.doFocus();
    }
  }

  nextMonthDate() {
    if (this.autoTransferData.recurringPayment.scheduleDate) {
      if (this.isOnSchedule) {
        return moment(this.autoTransferData.recurringPayment.scheduleDate).format('MM/DD/yyyy');
      }

      return moment(this.autoTransferData.recurringPayment.scheduleDate).add(1, 'month').format('MM/DD/yyyy');
    }

    return '';
  }

  getLinkNewAccountRouterLink() {
    return this.pageRoute.getLinkNewAccountRouterLink();
  }

  setTotalAmountValidation() {
    const entityId = this.localStorageService.getLoginUserId();

    this.TotalAmount?.clearValidators();
    this.TotalAmount?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    this.TotalAmount?.setValidators(
      Validators.compose([
        Validators.required,
        CustomValidator.greaterThan(20, true, 'Starting amount is $20', true),
        CustomValidator.lessThan(
          this.orgBalance.availableBalance || 0,
          true,
          `Amount should be less then Total Funds`,
          true
        ),
      ])
    );

    this.TotalAmount?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    if (entityId == 20707 || entityId == 20701) {
      this.TotalAmount?.clearValidators();
    }
  }

  getBalance() {
    this.isLoading = true;
    this.organizationAPI.getBalance().subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          res.scheduleDateTime = moment(moment.utc(res.scheduleDateTime).toDate()).local().toISOString();
          this.orgBalance = res;

          if (!!res.autoRedeemAmount) {
            this.isOnAutoRedeem = true;
          }

          if (res.scheduleId && res.scheduleId > 0) {
            this.isOnSchedule = true;
            this.formGroup.patchValue({
              isSchedule: true,
            });

            this.formGroup.updateValueAndValidity();

            this.autoTransferData.recurringPayment.scheduleDate = res.scheduleDateTime;

            if (res.recurrenceId) {
              this.autoTransferData.recurringPayment.frequency = res.recurrenceId;

              if (res.recurrenceId === 2) {
                this.autoTransferData.recurringPayment.selectedDay = moment(res.scheduleDateTime).format('dddd');
              }
            }
          }

          if (this.orgBalance.availableBalance) {
            this.orgBalance.availableToRedeem = this.orgBalance.availableBalance - (this.orgBalance.fee || 0);
            this.setTotalAmountValidation();
            return;
          }

          this.orgBalance.availableToRedeem = 0;
          this.setTotalAmountValidation();
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private getBankAccountList() {
    this.isAccountListLoading = true;
    this.accountAPI.getBankAccounts(this.Handle?.value).subscribe(
      (res) => {
        this.isAccountListLoading = false;
        if (res && res.data && res.data.length !== 0) {
          this.linkedAccountList = res.data.map((o) => ({ ...o, disabled: false }));
          if (res.data.length === 1) {
            const primaryAccount = res.data[0];
            this.BankAccountId?.patchValue(primaryAccount.bankAccountId);
          }

          if (res.data.length > 1) {
            const findDefaultAccount = this.linkedAccountList.find((o) => !!o.isDefault);
            if (findDefaultAccount) {
              this.BankAccountId?.patchValue(findDefaultAccount.bankAccountId);
            } else {
              const anyElse = res.data[0];
              this.BankAccountId?.patchValue(anyElse.bankAccountId);
            }
          }
        } else {
          this.noBankAccountLinked.emit(true);
        }
      },
      () => {
        this.isAccountListLoading = false;
      }
    );
  }

  onSetUpAutomaticTransfer() {
    this.setupAutomaticTransfer.emit(true);
  }

  onAutomaticTransfer() {
    this.setupAutomaticTransfer.emit(true);
  }

  onCancel(e: any) {
    e.stopPropagation();
    e.preventDefault();

    if (this.isOnAutoRedeem) {
      this.onCancelAutoRedeem();
      return;
    }

    if (this.isOnSchedule) {
      this.onCancelSchedule();
    }
  }

  private onCancelAutoRedeem() {
    if (!this.orgBalance.autoRedeemAmount) {
      return;
    }
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
        return;
      }
    });

    this.organizationAPI
      .saveOrganizationAutoRedeem({ triggerAmount: this.orgBalance.autoRedeemAmount, isStopRequest: true })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  private onCancelSchedule() {
    if (!this.orgBalance.scheduleId) {
      return;
    }

    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
        return;
      }
    });

    this.scheduleAPI
      .cancel({
        scheduleId: this.orgBalance.scheduleId,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }
}
