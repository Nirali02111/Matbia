import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { Observable, ReplaySubject } from 'rxjs';
import { DepositExternalPayload, DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { DepositType } from '@enum/DepositType';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { CustomValidator } from '@commons/custom-validator';
import moment from 'moment';
import { Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MaaserCalculatorPopupComponent } from '../../popups/maaser-calculator-popup/maaser-calculator-popup.component';
import { CommonDataService } from '@commons/common-data-service.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ChooseDepositeMethodComponent } from '../choose-deposite-method/choose-deposite-method.component';
import { AddFundsOtherMethodOptionLinksComponent } from '../add-funds-other-method-option-links/add-funds-other-method-option-links.component';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { CopyDataActionButtonComponent } from '@matbia/matbia-directive/components/copy-data-action-button/copy-data-action-button.component';
import { AccountHashComponent } from '@matbia/matbia-directive/components/account-hash/account-hash.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-check-deposit',
  templateUrl: './check-deposit.component.html',
  styleUrl: './check-deposit.component.scss',
  imports: [
    SharedModule,
    ChooseDepositeMethodComponent,
    AddFundsOtherMethodOptionLinksComponent,
    PhoneInputComponent,
    AmountInputComponent,
    InputErrorComponent,
    CopyDataActionButtonComponent,
    AccountHashComponent,
    AddressAutocompleteDirective,
  ],
})
export class CheckDepositComponent implements OnInit {
  active = 1;
  frontImageUrl = signal<string>('');
  backImageUrl = signal<string>('');

  refNumber = signal<string>('');
  displaySuccess = signal<boolean>(false);
  displayDepositMethods = signal<boolean>(false);

  formGroup = new FormGroup({
    amount: new FormControl(
      null,
      Validators.compose([Validators.required, CustomValidator.greaterThan(50, true, 'Starting amount is $50', true)])
    ),
    checkImageFront: new FormGroup({
      fileName: new FormControl<null | string>(null),
      fileBase64: new FormControl<null | string>(null, Validators.compose([Validators.required])),
    }),
    checkImageBack: new FormGroup({
      fileName: new FormControl<null | string>(null),
      fileBase64: new FormControl<null | string>(null, Validators.compose([Validators.required])),
    }),
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
  get AmountDigit() {
    return '10000000000';
  }

  get AmountField() {
    return this.formGroup.get('amount');
  }

  get Note() {
    return this.formGroup.get('note');
  }

  get FrontImageField() {
    return this.formGroup.get('checkImageFront')?.get('fileBase64');
  }

  get BackImageField() {
    return this.formGroup.get('checkImageBack')?.get('fileBase64');
  }

  get RefIdField() {
    return this.formGroup.get('refId');
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
  constructor(
    protected title: Title,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private panelPopup: PanelPopupsService,
    private notification: NotificationService,
    private donorTransactionAPI: DonorTransactionAPIService,
    private modalService: NgbModal,
    public commonDataService: CommonDataService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Add funds via Check');
    this.IsThirdPartyDeposit?.valueChanges.subscribe((val) => {
      if (val) {
        this.formGroup.get('payername')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('address')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('city')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('state')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('zip')?.setValidators(Validators.compose([Validators.required]));
        this.formGroup.get('email')?.setValidators(Validators.compose([Validators.required, CustomValidator.email()]));
        this.formGroup.get('phone')?.setValidators(Validators.compose([Validators.required]));
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
  onNavChange() {
    this.Note?.setValue(null);
    this.RefIdField?.markAsUntouched();
    this.RefIdField?.setValue(null);
  }

  getDashboardRouterLink() {
    return this.pageRoute.getDashboardRouterLink();
  }

  onOpenTermAndCondition(event: Event) {
    event.preventDefault();
    this.panelPopup.openTermsAndCondition();
  }

  onFileChange(event: any, isFront = true) {
    if (event.target.files && event.target.files.length) {
      const selectedFile = event.target.files[0];

      this.convertFile(selectedFile).subscribe((base64) => {
        if (isFront) {
          this.frontImageUrl.set(base64.result);
          this.formGroup.patchValue({
            checkImageFront: {
              fileName: selectedFile.name,
              fileBase64: base64.splitValue,
            },
          });

          this.formGroup.updateValueAndValidity();

          return;
        }

        this.backImageUrl.set(base64.result);
        this.formGroup.patchValue({
          checkImageBack: {
            fileName: selectedFile.name,
            fileBase64: base64.splitValue,
          },
        });

        this.formGroup.updateValueAndValidity();
      });
    }
  }

  convertFile(file: File): Observable<{
    result: string;
    splitValue: string;
  }> {
    const result = new ReplaySubject<{
      result: string;
      splitValue: string;
    }>(1);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) =>
      result.next({ result: e.target.result, splitValue: (e.target.result || 'base64,').split('base64,')[1] });
    return result;
  }

  onSubmit() {
    if (this.active === 2) {
      this.mailingFormSubmit();
      return;
    }

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const username = this.localStorage.getLoginUserUserName();
    const createdBy = this.localStorage.getLoginUserId() as number;
    const value = this.formGroup.value;

    this.executeExternalDeposit({
      userHandle: username,
      createdBy: createdBy,
      amount: value.amount ? +value.amount : null,
      depositType: DepositType.CHECK,
      checkDetails: {
        checkImageFront: value.checkImageFront?.fileBase64 as string,
        checkImageBack: value.checkImageBack?.fileBase64 as string,
        checkdeliveryType: 'upload',
      },
      depositDate: moment().toISOString(),
      note: value.note,
      externalRefNum: value.refId,
    });
  }

  private mailingFormSubmit() {
    if ((this.RefIdField?.invalid && this.Note?.invalid) || this.AmountField?.invalid) {
      this.AmountField?.markAllAsTouched();
      this.RefIdField?.markAllAsTouched();
      this.Note?.markAllAsTouched();
      return;
    }

    const username = this.localStorage.getLoginUserUserName();
    const createdBy = this.localStorage.getLoginUserId() as number;
    const value = this.formGroup.value;
    const payload: DepositExternalPayload = {
      userHandle: username,
      createdBy: createdBy,
      amount: this.AmountField?.value ? +this.AmountField?.value : null,
      externalRefNum: value.refId,
      checkDetails: {
        checkImageFront: null,
        checkImageBack: null,
        checkdeliveryType: 'mail',
      },
      depositType: DepositType.CHECK,
      depositDate: moment().toISOString(),
      note: value.note,
    };

    this.executeExternalDeposit(payload);
  }

  private executeExternalDeposit(formData: DepositExternalPayload) {
    const modalRef = this.notification.initLoadingPopup();

    modalRef.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
      }
    });
    if (this.IsThirdPartyDeposit?.value) {
      formData.payerInfo = {
        payerName: this.Payername?.value ?? null,
        address: this.Address?.value ?? null,
        city: this.City?.value ?? null,
        state: this.State?.value ?? null,
        zip: this.Zip?.value ?? null,
        email: this.Email?.value ?? null,
        phone: this.Phone?.value ?? null,
      };
    }
    this.donorTransactionAPI.depositExternal(formData).subscribe(
      (res) => {
        this.notification.hideLoader();
        if (!res) {
          return;
        }

        if (this.active === 2) {
          this.afterOfMailTransaction(res);
          return;
        }

        this.notification.displaySuccess(res);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  private afterOfMailTransaction(res: string) {
    this.notification.close();
    this.displaySuccess.set(true);
    const resArray = res.split(' ');
    if (resArray.length === 0) {
      return;
    }
    this.refNumber.set(resArray[resArray.length - 1]);
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

      this.AmountField?.setValue(result.charityAmount?.toFixed(2));
      this.Note?.setValue(noteValue);

      this.AmountField?.markAsTouched();
      this.AmountField?.markAsDirty();
      this.AmountField?.updateValueAndValidity();
    }
  }
  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
  }
}
