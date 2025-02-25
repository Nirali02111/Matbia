import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountAPIService, BankAccount } from '@services/API/account-api.service';
import {
  OrgBalanceResponse,
  OrgTransactionFeeResponse,
  OrganizationAPIService,
} from '@services/API/organization-api.service';
import { BatchPayload } from '@services/API/organization-transaction-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-close-current-batch-popup',
  templateUrl: './close-current-batch-popup.component.html',
  styleUrls: ['./close-current-batch-popup.component.scss'],
  imports: [SharedModule, InputErrorComponent, ButtonLoaderComponent],
})
export class CloseCurrentBatchPopupComponent implements OnInit {
  isBatchClosed = false;
  isLoading = false;
  isAccountListLoading = false;
  minAmount: number = 20;
  formGroup!: FormGroup;
  externalFees: any;

  @Input() linkedAccountList: Array<BankAccount & { disabled?: boolean }> = [];

  @Input() orgBalance!: OrgBalanceResponse & { availableToRedeem?: number };

  orgFee!: OrgTransactionFeeResponse;

  @Output() doBatch: EventEmitter<BatchPayload> = new EventEmitter();

  get CalculatedFees() {
    if (this.orgBalance && this.orgBalance.fee) {
      return this.orgBalance.fee;
    }

    return 0;
  }

  get NetAmount() {
    if (this.orgBalance && this.orgBalance.availableBalance) {
      return this.orgBalance.availableBalance - (this.orgBalance.fee || 0);
    }

    return 0;
  }

  get Handle() {
    return this.formGroup.get('handle');
  }

  get BankAccountId() {
    return this.formGroup.get('bankAccountId');
  }

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private organizationAPI: OrganizationAPIService,
    private localStorageService: LocalStorageDataService,
    private accountAPI: AccountAPIService
  ) {}

  ngOnInit(): void {
    const userHandle = this.localStorageService.getLoginUserUserName();

    this.formGroup = this.fb.group({
      handle: this.fb.control(userHandle, Validators.compose([Validators.required])),
      bankAccountId: this.fb.control(null, Validators.compose([Validators.required])),
    });

    if (!this.orgBalance) {
      this.getBalance();
    }

    if (!this.linkedAccountList || this.linkedAccountList.length === 0) {
      this.getBankAccountList();
    }

    this.processBankAccounts({ data: this.linkedAccountList });

    this.getExternalFees();
  }

  private getBalance() {
    this.isLoading = true;
    this.organizationAPI.getBalance().subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.orgBalance = res;
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private getExternalFees() {
    this.isAccountListLoading = true;
    this.organizationAPI.getExternalFee().subscribe(
      (res) => {
        this.isAccountListLoading = false;
        this.externalFees = res.fee;
      },
      () => {
        this.isAccountListLoading = false;
      }
    );
  }

  private getBankAccountList() {
    this.isAccountListLoading = true;
    this.accountAPI.getBankAccounts(this.Handle?.value).subscribe(
      (res) => {
        this.isAccountListLoading = false;
        this.processBankAccounts(res);
      },
      () => {
        this.isAccountListLoading = false;
      }
    );
  }

  private processBankAccounts(res: { data: Array<BankAccount> }) {
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
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onBatch() {
    this.doBatch.emit({
      bankAccountId: this.BankAccountId?.value,
      handle: this.Handle?.value,
      createdBy: +this.localStorageService.getLoginUserId(),
    });
    this.closePopup();
  }
}
