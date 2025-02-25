import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { DepositExternalPayload, DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { DepositType } from '@enum/DepositType';
import { NotificationService } from '@commons/notification.service';
import { CustomValidator } from '@commons/custom-validator';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { PageRouteVariable } from '@commons/page-route-variable';
import { Title } from '@angular/platform-browser';
import { MaaserCalculatorPopupComponent } from '../../popups/maaser-calculator-popup/maaser-calculator-popup.component';
import { CommonDataService } from '@commons/common-data-service.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ChooseDepositeMethodComponent } from '../choose-deposite-method/choose-deposite-method.component';
import { AddFundsOtherMethodOptionLinksComponent } from '../add-funds-other-method-option-links/add-funds-other-method-option-links.component';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-paypal-credit-deposit-funds',
  templateUrl: './paypal-credit-deposit-funds.component.html',
  styleUrl: './paypal-credit-deposit-funds.component.scss',
  imports: [
    SharedModule,
    ChooseDepositeMethodComponent,
    AddFundsOtherMethodOptionLinksComponent,
    PhoneInputComponent,
    AmountInputComponent,
    InputErrorComponent,
    AddressAutocompleteDirective,
  ],
})
export class PaypalCreditDepositFundsComponent implements OnInit {
  formGroup = new FormGroup({
    amount: new FormControl(
      null,
      Validators.compose([Validators.required, CustomValidator.greaterThan(50, true, 'Starting amount is $50', true)])
    ),
    refId: new FormControl(null, Validators.compose([Validators.required])),
    note: new FormControl<string | null>(null),
    isThirdPartyDeposit: new FormControl(null),
    payername: new FormControl(null),
    address: new FormControl(null),
    city: new FormControl(null),
    state: new FormControl(null),
    zip: new FormControl(null),
    email: new FormControl(null),
    phone: new FormControl(null),
  });
  private _isAnimate = false;

  get IsAnimate() {
    return this._isAnimate;
  }
  get RefIdField() {
    return this.formGroup.get('refId');
  }

  get AmountDigit() {
    return '10000000000';
  }

  get Amount() {
    return this.formGroup.get('amount');
  }

  get note() {
    return this.formGroup.get('note');
  }
  get IsThirdPartyDeposit() {
    return this.formGroup.get('isThirdPartyDeposit');
  }
  get Payername() {
    return this.formGroup.get('payername');
  }
  get Address() {
    return this.formGroup.get('address');
  }
  get City() {
    return this.formGroup.get('city');
  }
  get State() {
    return this.formGroup.get('state');
  }
  get Zip() {
    return this.formGroup.get('zip');
  }
  get Email() {
    return this.formGroup.get('email');
  }
  get Phone() {
    return this.formGroup.get('phone');
  }
  isAutoSuggestion = true;
  zipCodeMask: string = '00000';
  zipCodeValidation = true;
  displayDepositMethods = signal<boolean>(false);

  constructor(
    protected title: Title,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private donorTransactionAPI: DonorTransactionAPIService,
    private notification: NotificationService,
    private localStorage: LocalStorageDataService,
    private panelPopup: PanelPopupsService,
    private modalService: NgbModal,
    public commonDataService: CommonDataService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Add funds via Paypal/Credit cards');
    this.IsThirdPartyDeposit?.valueChanges.subscribe((val) => {
      if (val) {
        this.formGroup.get('payername')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('address')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('city')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('state')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('zip')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('email')?.setValidators(Validators.compose([Validators.required, CustomValidator.email()]));
        this.formGroup.get('phone')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.updateValueAndValidity();
      } else {
        this.formGroup.get('payername')?.clearValidators();
        this.formGroup.get('address')?.clearValidators();
        this.formGroup.get('city')?.clearValidators();
        this.formGroup.get('state')?.clearValidators();
        this.formGroup.get('zip')?.clearValidators();
        this.formGroup.get('email')?.clearValidators();
        this.formGroup.get('phone')?.clearValidators();
      }
      this.formGroup.get('payername')?.updateValueAndValidity();
      this.formGroup.get('address')?.updateValueAndValidity();
      this.formGroup.get('city')?.updateValueAndValidity();
      this.formGroup.get('state')?.updateValueAndValidity();
      this.formGroup.get('zip')?.updateValueAndValidity();
      this.formGroup.get('email')?.updateValueAndValidity();
      this.formGroup.get('phone')?.updateValueAndValidity();
    });
  }
  onAddressChange(data: any) {
    if (data.notFound) {
      this.Address?.setErrors({
        googleMapError: data.notFound,
      });

      this.Address?.markAsTouched();

      this.triggerAnimation();
      return;
    }

    let streetAddress = data.streetName;

    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }

    this.formGroup.patchValue({
      address: streetAddress,
      city: data.locality.long || data.locality.short || data.sublocality,
      state: data.state.short,
      zip: data.postalCode,
    });

    if (!data?.country?.isFromUSA) {
      this.zipCodeMask = '';
      this.zipCodeValidation = false;
      this.Zip?.clearValidators();
      this.Zip?.updateValueAndValidity();
    }

    if (data?.country?.isFromUSA) {
      this.zipCodeMask = '00000';
      this.zipCodeValidation = true;
      this.Zip?.clearValidators();
      this.Zip?.setValidators(
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      );
      this.Zip?.updateValueAndValidity();
    }

    this.formGroup.updateValueAndValidity();
  }
  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }
  openPaypal() {
    window.open('https://www.paypal.com/US/fundraiser/charity/4698292', '_blank');
  }

  openTutorial(content: any) {
    this.panelPopup.open(content, {
      windowClass: 'modal-tutorial',
      centered: true,
      size: 'lg',
    });
  }

  onCloseTutorial(event: Event, modal: NgbModalRef) {
    event.preventDefault();
    modal.close();
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.executeExternalDeposit();
  }

  private executeExternalDeposit() {
    const username = this.localStorage.getLoginUserUserName();
    const createdBy = this.localStorage.getLoginUserId() as number;
    const value = this.formGroup.value;

    const modalRef = this.notification.initLoadingPopup();

    modalRef.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
      }
    });
    const payload: DepositExternalPayload = {
      amount: value.amount ? +value.amount : null,
      userHandle: username,
      createdBy: createdBy,
      externalRefNum: value.refId,
      depositType: DepositType.PAYPAL,
      note: value.note,
      depositDate: moment().toISOString(),
    };
    if (this.IsThirdPartyDeposit?.value) {
      payload.payerInfo = {
        payerName: this.Payername?.value ?? null,
        address: this.Address?.value ?? null,
        city: this.City?.value ?? null,
        state: this.State?.value ?? null,
        zip: this.Zip?.value ?? null,
        email: this.Email?.value ?? null,
        phone: this.Phone?.value ?? null,
      };
    }
    this.donorTransactionAPI.depositExternal(payload).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.displaySuccess(res);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
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

    modalRef.closed.subscribe((result: any) => {
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
  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
  }
}
