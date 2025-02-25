import { AfterContentInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { TransactionStatus, TransactionTypes } from '@enum/Transaction';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { NotificationService } from '@commons/notification.service';

import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { DonorAPIService } from '@services/API/donor-api.service';
import { ScheduleAPIService } from '@services/API/schedule-api.service';

import { ScheduleObj } from 'src/app/models/panels';

import { RecurringDepositPopupComponent } from '../recurring-deposit-popup/recurring-deposit-popup.component';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '@commons/custom-validator';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { SettingAPIService } from '@services/API/setting-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ListItemComponent } from '../list-item/list-item.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [
    SharedModule,
    ListItemComponent,
    MatbiaSkeletonLoaderComponentComponent,
    AmountInputComponent,
    InputErrorComponent,
  ],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class ListViewComponent implements OnInit, AfterContentInit {
  isLoading = false;
  isThresholdLoading = false;
  isThresholdBankLoading = false;
  replenishAmount: string | null = null;
  triggerAmount: string | null = null;
  active = 1;
  defaultBankDetails: BankAccount | null = null;

  rows$!: Observable<Array<ScheduleObj>>;
  total$!: Observable<number>;
  linkedAccountList: Array<BankAccount> = [];
  formGroup!: FormGroup;

  thresholdFormGroup!: FormGroup;

  isThresholdEdited = false;
  isAccountListLoading: boolean = false;
  isNotAvailable: boolean = false;

  lowBalence: string = 'LowBalence';
  coverDeclinedDonations: string = 'CoverDeclinedDonations';
  selectedOption: string = 'LowBalence';

  replenishAmt: number | null = 0;
  maxAmt: number | null = null;
  fundingDisabled = false;
  isDevEnv: boolean = false;

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }
  get ReplenishAmount() {
    return this.formGroup.get('replenishAmount');
  }
  get MaxAmount() {
    return this.formGroup.get('maxAmount');
  }
  get ReplenishedChecked() {
    return this.formGroup.get('isReplenishChecked');
  }
  get MaxAmountChecked() {
    return this.formGroup.get('isMaxAmountChecked');
  }

  get isLowBalance() {
    return this.thresholdFormGroup.get('isActive');
  }

  get isDeclinedDonation() {
    return this.formGroup.get('isActive');
  }

  get AmountDigit() {
    return '10000000000';
  }

  get ThresholdReplenishAmount() {
    return this.thresholdFormGroup.get('amount');
  }

  get ThresholdTriggerAmount() {
    return this.thresholdFormGroup.get('triggerAmount');
  }

  get ThresholdBankAccountId() {
    return this.thresholdFormGroup.get('bankAccountId');
  }

  setBankAccountId(value: any) {
    this.BankAccountId?.patchValue(value);
  }

  setReplenishAmount(value: any) {
    this.ReplenishAmount?.patchValue(value);
  }

  setMaxAmount(value: any) {
    this.MaxAmount?.patchValue(value);
  }

  setIsMaxAmountChecked(value: boolean) {
    this.MaxAmountChecked?.patchValue(value);
  }

  setIsReplenishChecked(value: boolean) {
    this.ReplenishedChecked?.patchValue(value);
  }

  replenishOriginalValue = false;

  get lowBalanceOriginalValue() {
    return this.replenishAmount || this.triggerAmount ? true : false;
  }

  showReplenishFooter() {
    return (
      this.isDeclinedDonation?.touched ||
      this.BankAccountId?.touched ||
      this.MaxAmount?.touched ||
      this.MaxAmountChecked?.dirty ||
      this.ReplenishedChecked?.dirty ||
      this.ReplenishAmount?.touched
    );
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    protected title: Title,
    private modalService: NgbModal,
    private commonDataService: CommonDataService,
    private localStorage: LocalStorageDataService,
    private popupService: PanelPopupsService,
    private accountAPI: AccountAPIService,
    private donorAPI: DonorAPIService,
    private scheduleApi: ScheduleAPIService,
    private notification: NotificationService,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<ScheduleObj>,
    private fb: FormBuilder,
    private settingAPI: SettingAPIService,
    private matbiaObserver: MatbiaObserverService
  ) {}
  isMobile: boolean = false;

  ngOnInit(): void {
    this.checkIfMobile();
    this.initForm();

    this.title.setTitle('Matbia - Auto-Deposits');
    this.rows$ = this.gridService.rows$;
    this.total$ = this.gridService.total$;

    this.rows$.subscribe(() => {});
    this.gridService.Pagination = false;

    this.gridService.queryFilter = {
      transType: [TransactionTypes.DEPOSIT],
      status: [TransactionStatus.SCHEDULED],
    };

    this.refreshPageData();
    this.getAccountList();
    this.getFundingValue();
    this.getDeclineReplenishDetails();

    this.isLowBalance?.valueChanges.subscribe((val) => {
      if (val) {
        this.isDeclinedDonation?.patchValue(false);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.isDeclinedDonation?.valueChanges.subscribe((val) => {
      if (val) {
        this.isLowBalance?.patchValue(false);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.ReplenishedChecked?.valueChanges.subscribe((val) => {
      if (val) {
        this.ReplenishAmount?.clearValidators();
        this.ReplenishAmount?.enable();
        this.ReplenishAmount?.setValidators(
          Validators.compose([CustomValidator.greaterThan(50, true, 'Starting amount is $50', false, false)])
        );
      } else {
        this.ReplenishAmount?.clearValidators();
        this.ReplenishAmount?.disable();
        this.ReplenishAmount?.reset();
      }

      this.ReplenishAmount?.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });

    this.MaxAmountChecked?.valueChanges.subscribe((val) => {
      if (val) {
        this.MaxAmount?.clearValidators();
        this.MaxAmount?.enable();
        this.MaxAmount?.setValidators(
          Validators.compose([CustomValidator.greaterThan(50, true, 'Starting amount is $50', false, false)])
        );
      } else {
        this.MaxAmount?.clearValidators();
        this.MaxAmount?.disable();
        this.MaxAmount?.reset();
      }

      this.MaxAmount?.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    this.ThresholdReplenishAmount?.valueChanges.subscribe((val) => {
      if (!val) {
        this.isThresholdEdited = false;
      }

      if (val && val !== this.replenishAmount) {
        this.isThresholdEdited = true;
      }
    });

    this.ThresholdTriggerAmount?.valueChanges.subscribe((val) => {
      if (!val) {
        this.isThresholdEdited = false;
      }

      if (val && val !== this.triggerAmount) {
        this.isThresholdEdited = true;
      }
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  initForm() {
    this.formGroup = this.fb.group({
      bankAccountId: this.fb.control(null, Validators.compose([Validators.required])),
      replenishAmount: this.fb.control(
        null,
        Validators.compose([CustomValidator.greaterThan(50, true, 'Starting amount is $50', false, true)])
      ),
      maxAmount: this.fb.control(
        null,
        Validators.compose([CustomValidator.greaterThan(50, true, 'Starting amount is $50', false, true)])
      ),
      isReplenishChecked: this.fb.control(false),
      isMaxAmountChecked: this.fb.control(false),
      isActive: this.fb.control(false),
    });

    this.thresholdFormGroup = this.fb.group({
      amount: this.fb.control(
        null,
        Validators.compose([Validators.required, CustomValidator.greaterThan(20, true, 'Starting amount is $20', true)])
      ),
      triggerAmount: this.fb.control(
        null,
        Validators.compose([
          Validators.required,
          CustomValidator.greaterThan(0.01, true, 'Starting amount is $0.01', true),
        ])
      ),
      bankAccountId: this.fb.control(null, Validators.compose([Validators.required])),
      isActive: this.fb.control(false),
    });
  }

  private getDonorInfo() {
    this.isThresholdLoading = true;
    const username = this.localStorage.getLoginUserUserName();
    this.donorAPI.get(username).subscribe(
      (res) => {
        this.isThresholdLoading = false;
        if (res) {
          if (res?.replenishAmount) {
            this.replenishAmount = this.commonDataService.getNumberWithFormate(res.replenishAmount.toString());

            this.thresholdFormGroup.patchValue(
              {
                amount: this.replenishAmount,
                isActive: true,
              },
              { emitEvent: false }
            );
          } else {
            this.replenishAmount = null;
          }

          if (res?.triggerAmount) {
            this.triggerAmount = this.commonDataService.getNumberWithFormate(res.triggerAmount.toString());
            this.thresholdFormGroup.patchValue(
              {
                triggerAmount: this.triggerAmount,
                isActive: true,
              },
              { emitEvent: false }
            );
          } else {
            this.triggerAmount = null;
          }

          this.thresholdFormGroup.updateValueAndValidity();
          this.thresholdFormGroup.markAsPristine();
          this.isLowBalance?.markAsUntouched();
          this.changeDetectorRef.detectChanges();
        }
      },
      () => {
        this.isThresholdLoading = false;
      }
    );
  }

  private getData() {
    this.isLoading = true;
    this.scheduleApi
      .getDonorAll({
        fromDate: null,
        toDate: null,
      })
      .subscribe((res) => {
        this.isLoading = false;

        this.gridService.ListData = res.donorSchedules || [];
        this.changeDetectorRef.detectChanges();
      });
  }

  refreshPageData() {
    this.getData();
    this.getDonorInfo();
  }

  private getAccountList() {
    this.isThresholdBankLoading = true;
    this.isAccountListLoading = true;
    const username = this.localStorage.getLoginUserUserName();
    this.accountAPI.getBankAccounts(username).subscribe(
      (res) => {
        this.isAccountListLoading = false;
        this.isThresholdBankLoading = false;

        if (res && res.data.length !== 0) {
          if (res.firstAccount) {
            this.defaultBankDetails = res.firstAccount;
            this.thresholdFormGroup.patchValue({
              bankAccountId: res.firstAccount.bankAccountId,
            });
            this.thresholdFormGroup.updateValueAndValidity();
          }
          this.linkedAccountList = res.data;
          this.BankAccountId?.clearValidators();
          this.BankAccountId?.setValidators(
            Validators.compose([Validators.required, CustomValidator.bankAccountInactive(this.linkedAccountList)])
          );
        }

        this.changeDetectorRef.detectChanges();
      },
      () => {
        this.isThresholdBankLoading = false;
        this.isAccountListLoading = false;
      }
    );
  }

  private getPopup() {
    return this.modalService.open(RecurringDepositPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'auto-recurring-deposit-modal modal-funds',
      size: 'md',
      scrollable: true,
      fullscreen: 'md',
    });
  }

  onCreateNew(preFilled = null) {
    const modalRef = this.getPopup();

    modalRef.componentInstance.oldApiData = preFilled;

    modalRef.componentInstance.reopen.subscribe((preFilled: any) => {
      this.onCreateNew(preFilled);
    });

    this.commonPopup(modalRef);
  }

  onEdit(item: ScheduleObj, preFilled = null) {
    const modalRef = this.getPopup();
    modalRef.componentInstance.isEditSchedule = true;
    modalRef.componentInstance.scheduleId = item.firstScheduleId;

    modalRef.componentInstance.oldApiData = preFilled;

    modalRef.componentInstance.reopen.subscribe((preFilled: any) => {
      this.onEdit(item, preFilled);
    });

    this.commonPopup(modalRef);
  }

  onThresholdEdit() {
    const modalRef = this.getPopup();
    modalRef.componentInstance.isThreshold = true;
    modalRef.componentInstance.replenishAmount = this.replenishAmount;
    modalRef.componentInstance.triggerAmount = this.triggerAmount;

    this.commonPopup(modalRef);
  }

  openScheduleDetails(event: any, item: ScheduleObj) {
    if (event) {
      event.stopPropagation();
    }
    const modalRef = this.popupService.openScheduleDetail();
    modalRef.componentInstance.scheduleId = item.firstScheduleId;

    modalRef.componentInstance.refresh.subscribe(() => {
      this.refreshPageData();
    });
  }

  private commonPopup(modalRef: NgbModalRef) {
    modalRef.componentInstance.refresh.subscribe(() => {
      this.refreshPageData();
    });
  }

  onSaveThreshold() {
    if (this.ThresholdReplenishAmount?.invalid || this.ThresholdTriggerAmount?.invalid) {
      this.thresholdFormGroup.markAllAsTouched();
      return;
    }

    const userId = this.localStorage.getLoginUserId();
    const loader = this.notification.initLoadingPopup();
    const username = this.localStorage.getLoginUserUserName();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.getDonorInfo();
        return;
      }
    });

    this.donorAPI
      .saveAutoReplenish({
        userHandle: username,
        triggerAmount: this.ThresholdTriggerAmount?.value,
        replenishAmount: this.ThresholdReplenishAmount?.value,
        isActive: this.isLowBalance?.value,
        createdBy: userId || 0,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
          this.isThresholdEdited = false;
          this.isLowBalance?.markAsUntouched();
        },
        (err) => {
          this.notification.hideLoader();
          this.notification.displayError(err.error);
        }
      );
  }

  onRemoveThreshold() {
    if (!this.triggerAmount || !this.replenishAmount) {
      return;
    }
    const modalRef = this.notification.initConfirmPopup();

    modalRef.then((res) => {
      if (res.isConfirmed) {
        this.doRemoveThreshold();
      }
    });
  }

  private doRemoveThreshold() {
    const username = this.localStorage.getLoginUserUserName();
    const userId = this.localStorage.getLoginUserId();
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.refreshPageData();

        this.replenishAmount = null;
        this.triggerAmount = null;
        return;
      }
    });

    this.donorAPI
      .saveAutoReplenish({
        userHandle: username,
        triggerAmount: Number(this.triggerAmount),
        replenishAmount: Number(this.replenishAmount),
        isActive: false,
        createdBy: userId || 0,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.hideLoader();
          this.notification.displayError(err.error);
        }
      );
  }

  onCancelSchedule(item: ScheduleObj) {
    this.doCancelSchedule(item);
  }

  private doCancelSchedule(item: ScheduleObj) {
    this.isLoading = true;
    this.scheduleApi
      .cancel({
        scheduleId: item.firstScheduleId,
        sendCancellationEmail: true,
        isStopStatus: true,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.notification.showSuccess(res);
          this.refreshPageData();
        },
        (err) => {
          this.isLoading = false;
          this.notification.showError(err.error);
        }
      );
  }

  toggleDiv: { [key: number]: boolean } = {
    1: false,
    2: false,
    3: false,
  };

  toggleContent(id: number) {
    this.toggleDiv[id] = !this.toggleDiv[id];
  }

  selectOption(option: string) {
    if (this.selectedOption === option) {
      this.selectedOption = '';
    } else {
      this.selectedOption = option;
    }

    this.changeDetectorRef.detectChanges();
  }

  getFundingValue() {
    this.settingAPI.getEntitySetting('IsInstantFundingEnabled').subscribe((settingRes) => {
      if (settingRes.settingValue == '0') {
        this.isNotAvailable = true;
      }
    });
  }

  getDeclineReplenishDetails() {
    this.donorAPI.getDeclineReplenish().subscribe(
      (res) => {
        if (res) {
          this.fundingDisabled = res.fundingDisabled;
          this.replenishAmt = res.replenishAmount || null;
          this.maxAmt = res.maxAmount || null;

          if (res.isActive) {
            this.isDeclinedDonation?.patchValue(true);
            this.changeDetectorRef.detectChanges();
            this.replenishOriginalValue = res.isActive;
          }

          if (res.bankAccountId) {
            this.setBankAccountId(res.bankAccountId);
            this.BankAccountId?.markAsTouched();
          }

          if (res.fundingDisabled) {
            this.isNotAvailable = true;
            if (res.maxAmount) {
              this.MaxAmount?.disable();
              this.MaxAmountChecked?.disable();
            }
            if (res.replenishAmount) {
              this.ReplenishAmount?.disable();
              this.ReplenishedChecked?.disable();
            }
            if (res.bankAccountId) {
              this.BankAccountId?.disable();
            }
          }

          if (this.replenishAmt) {
            this.formGroup.patchValue(
              {
                replenishAmount: res.replenishAmount,
                isReplenishChecked: true,
              },
              { emitEvent: false }
            );
          }

          if (this.maxAmt) {
            this.formGroup.patchValue(
              {
                maxAmount: res.maxAmount,
                isMaxAmountChecked: true,
              },
              { emitEvent: false }
            );
          }

          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAsUntouched();
          this.changeDetectorRef.detectChanges();
        }
      },
      (err) => {
        this.notification.showError(err.error);
      }
    );
  }

  saveDeclineReplenish() {
    if (this.MaxAmount?.invalid || this.ReplenishAmount?.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const loader = this.notification.initLoadingPopup();

    loader.then(() => {});

    const obj = {
      userHandle: this.localStorage.getLoginUserUserName(),
      replenishAmount: this.ReplenishAmount?.value,
      maxAmount: this.MaxAmount?.value,
      isActive: this.isDeclinedDonation?.value,
      bankAccountId: this.BankAccountId?.value,
      createdBy: this.localStorage.getLoginUserId() || 0,
    };

    this.donorAPI.saveDeclineReplenish(obj).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.displaySuccess(res);
        this.getDeclineReplenishDetails();
        this.isDeclinedDonation?.markAsUntouched();
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error);
      }
    );
  }

  cancel() {
    if (this.replenishAmt || this.maxAmt) {
      this.setReplenishAmount(this.replenishAmt);
      this.setMaxAmount(this.maxAmt);

      this.formGroup.markAsPristine();
      return;
    }
    this.formGroup.reset();

    this.formGroup.markAsPristine();
  }

  cancelThreshold() {
    setTimeout(() => {
      this.thresholdFormGroup.patchValue({
        amount: this.replenishAmount,
        triggerAmount: this.triggerAmount,
        isActive: this.replenishAmount || this.triggerAmount ? true : false,
      });

      this.thresholdFormGroup.updateValueAndValidity();
      this.isThresholdEdited = false;
      this.isLowBalance?.markAsUntouched();
      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  clearValue() {
    this.formGroup.patchValue({
      replenishAmount: this.replenishAmt,
      maxAmount: this.maxAmt,
      isReplenishChecked: this.replenishAmt ? true : false,
      isMaxAmountChecked: this.maxAmt ? true : false,
      isActive: this.replenishOriginalValue,
    });

    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsPristine();
    this.isDeclinedDonation?.markAsUntouched();
    this.changeDetectorRef.detectChanges();
  }

  checkToggleStatus(id: number): boolean {
    return this.toggleDiv[id];
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkIfMobile.bind(this));
  }
}
