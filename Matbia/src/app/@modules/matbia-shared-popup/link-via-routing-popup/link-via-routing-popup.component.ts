import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountAPIService, VerifyAccountPayload } from '@services/API/account-api.service';
import { DonorAPIService } from '@services/API/donor-api.service';
import { AnalyticsService } from '@services/analytics.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { BankAndCreditCardFormGroupComponent } from '@matbia/matbia-form-group/bank-and-credit-card-form-group/bank-and-credit-card-form-group.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-link-via-routing-popup',
  templateUrl: './link-via-routing-popup.component.html',
  styleUrls: ['./link-via-routing-popup.component.scss'],
  imports: [SharedModule, BankAndCreditCardFormGroupComponent, ButtonLoaderComponent],
})
export class LinkViaRoutingPopupComponent implements OnInit {
  isLoading = false;
  setupAccountForm!: UntypedFormGroup;
  bankDetailForm!: UntypedFormGroup;

  isSuccess = false;
  alertMessage = '';
  alertType = 'success';

  @Input() isError = false;
  @Input() userHandle!: string;

  @Input() accountName!: string;

  @Input() requestKYCFirst = true;

  @Output() linked = new EventEmitter();

  get RoutingNumber() {
    return this.bankDetailForm.get('routingNumber');
  }

  get AccountNumber() {
    return this.bankDetailForm.get('accountNumber');
  }

  get ConfirmAccountNumber() {
    return this.bankDetailForm.get('confirmNumber');
  }

  constructor(
    private fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private accountApi: AccountAPIService,
    private matbiaDonorAPI: DonorAPIService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  onClose() {
    this.activeModal.close();
  }

  resetState() {
    this.alertMessage = '';
  }

  displayMessage(message: string) {
    this.alertMessage = message;
  }

  displaySuccess(message: string) {
    this.displayMessage(message);
    this.alertType = 'success';
  }

  displayDanger(message: string) {
    this.displayMessage(message);
    this.alertType = 'danger';
  }

  initForm() {
    this.bankDetailForm = this.matbiaFormGroupService.initBankAndCreditCard({
      optionType: 'bank',
      accountType: '',
      accountName: this.accountName,
      routingNumber: '',
      accountNumber: '',
      confirmNumber: '',
      nameOnCard: '',
      cardNumber: '',
      cardExp: '',
      cvv: '',
      checkType: 'Personal',
    });

    this.setupAccountForm = this.fb.group({});

    this.setupAccountForm.addControl('bankDetailForm', this.bankDetailForm);

    this.AccountNumber?.valueChanges.subscribe((val) => {
      if (val) {
        const conf = this.ConfirmAccountNumber?.value;
        if (conf !== undefined && conf.trim() !== '' && conf !== val) {
          this.ConfirmAccountNumber?.setErrors({ mismatch: true });
        }
        this.ConfirmAccountNumber?.updateValueAndValidity();
      }
    });

    this.RoutingNumber?.valueChanges.subscribe(() => {
      this.resetState();
    });

    this.AccountNumber?.valueChanges.subscribe(() => {
      this.resetState();
    });

    this.ConfirmAccountNumber?.valueChanges.subscribe(() => {
      this.resetState();
    });
  }

  onSetupAccount() {
    this.resetState();
    if (this.isSuccess) {
      this.onDone();
      return;
    }
    if (this.bankDetailForm.invalid) {
      this.bankDetailForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const objData = {
      ...this.bankDetailForm.value,
      userHandle: this.userHandle,
    };

    if (this.requestKYCFirst) {
      this.requestKYC(objData);
    } else {
      this.linkCallAPI(objData);
    }
  }

  requestKYC(objData: any) {
    this.matbiaDonorAPI.requestKYC(this.userHandle).subscribe(
      (response) => {
        if (response.errors && response.errors.length !== 0) {
          this.displayDanger(response.errors[0].error);
          this.isLoading = false;
          return;
        }

        if (!response.success) {
          this.displayDanger(response.data.message);
          this.isLoading = false;
          return;
        }

        if (response.success) {
          this.linkCallAPI(objData);
          return;
        }

        this.isLoading = false;
        this.displayDanger('something want wrong');
      },
      (err) => {
        this.isLoading = false;
        this.displayDanger(err.error);
      }
    );
  }

  linkCallAPI(objData: any) {
    const apiPayloadData: VerifyAccountPayload = {
      routingNum: objData.routingNumber,
      accountNum: objData.accountNumber,
      accountType: objData.accountType,
      entityHandle: objData.userHandle,
      checkType: objData.checkType,
    };

    this.accountApi.saveAndVerifyAccount(apiPayloadData).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.errors && res.errors.length > 0) {
          this.isError = true;
          this.displayDanger(res.errors[0].error);
          return;
        }

        if (!res.success) {
          this.isError = true;
          this.displayDanger(res.message);
          return;
        }

        this.isError = false;
        this.isSuccess = true;
        this.displaySuccess('Account Added!');
        this.analytics.initBankConnectedEvent();
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this.displayDanger(err.error);
      }
    );
  }

  onDone() {
    this.onClose();
    this.linked.emit(true);
  }

  onGoBackAndRetry() {
    if (this.AccountNumber?.value) this.isError = false;
    else this.activeModal.close(true);
  }
}
