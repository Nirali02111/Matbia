import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { shakeTrigger } from '@commons/animations';
import { CustomValidator } from '@commons/custom-validator';
import { PageRouteVariable } from '@commons/page-route-variable';
import { DonorAPIService } from '@services/API/donor-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { ChangeCardPinPopupComponent } from '../popups/change-card-pin-popup/change-card-pin-popup.component';
import { MatbiaCardCornerSettingPopupComponent } from '../popups/matbia-card-corner-setting-popup/matbia-card-corner-setting-popup.component';

interface InputAmountAndCorner {
  inputValue: string;
  cornerId: number;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { CardPinInputComponent } from '@matbia/matbia-input/card-pin-input/card-pin-input.component';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';
import { AccountHashComponent } from '@matbia/matbia-directive/components/account-hash/account-hash.component';
import { CardExpiryInputComponent } from '@matbia/matbia-input/card-expiry-input/card-expiry-input.component';

@Component({
  selector: 'app-matbia-card-form-group',
  templateUrl: './matbia-card-form-group.component.html',
  styleUrls: ['./matbia-card-form-group.component.scss'],
  imports: [
    SharedModule,
    CardPinInputComponent,
    PhoneInputComponent,
    CreditCardInputComponent,
    AccountHashComponent,
    CardExpiryInputComponent,
  ],
  animations: [shakeTrigger],
})
export class MatbiaCardFormGroupComponent implements OnInit, AfterContentInit, AfterViewInit {
  firstCornerVisited = false;
  secondCornerVisited = false;
  thirdCornerVisited = false;
  fourthCornerVisited = false;
  isGenerated = false;

  canSubmit = false;

  phoneList: Array<{ label: string; value: string | null }> = [];

  @ViewChild('presetAmtRef', { static: false }) presetAmtRef!: ElementRef<HTMLInputElement>;

  @ViewChild('chargeRandomMaxAmtRef', { static: false }) chargeRandomMaxAmtRef!: ElementRef<HTMLInputElement>;
  @ViewChild('chargeRandomMinAmtRef', { static: false }) chargeRandomMinAmtRef!: ElementRef<HTMLInputElement>;
  @ViewChild('cornerSettingModal') cornerSettingModal!: any;

  @ViewChild('setupCapPerUserAttemptOneAmtRef', { static: false })
  setupCapPerUserAttemptOneAmtRef!: ElementRef<HTMLInputElement>;
  @ViewChild('setupCapPerUserAttemptTwoAmtRef', { static: false })
  setupCapPerUserAttemptTwoAmtRef!: ElementRef<HTMLInputElement>;
  @ViewChild('setupCapPerUserAttemptThreeAmtRef', { static: false })
  setupCapPerUserAttemptThreeAmtRef!: ElementRef<HTMLInputElement>;
  @ViewChild('setupCapPerUserAttemptFourAmtRef', { static: false })
  setupCapPerUserAttemptFourAmtRef!: ElementRef<HTMLInputElement>;

  @ViewChild('nameOnCardCtrl', { static: false })
  nameOnCardCtrl!: ElementRef<HTMLInputElement>;
  @ViewChild('inputFocusField') focusField!: ElementRef;

  public formatPresetAmt$ = new Subject<InputAmountAndCorner>();

  public formatChargeRandomMaxAmt$ = new Subject<InputAmountAndCorner>();
  public formatChargeRandomMinAmt$ = new Subject<InputAmountAndCorner>();

  public formatCapAtpAmt$ = new Subject<InputAmountAndCorner & { attemptField: string }>();

  public cardSelectorCorner = 1;
  public CVVMASK = '0000';

  inAnimation = false;

  // card setting info
  openInfo = false;
  titleCardCornersettings: any;
  popupCornerNo: number = 0;
  settingPopupTabName: string = 'presetamounttab';
  popupCornerValues: any;
  @Input() formGroup!: UntypedFormGroup;

  @Input() expiry: string | null = null;

  @Input() isEndWithnine: boolean = false;

  /**
   * Allow Lock-unlock button
   */
  @Input() allowLockUnlock = true;

  /**
   * Allow Replace card button
   */
  @Input() allowReplaceCard = true;

  /**
   * Allow Replace card button
   */
  @Input() cardSettingButton = true;

  /**
   * Allow change Pin setting button
   */
  @Input() changePinSettingButton = false;

  /**
   * Event to notify parent component that all corner are visited
   */
  @Output() allCornerSet = new EventEmitter();

  /**
   * Event to notify parent component that Replace card button click
   */
  @Output() replaceThisCard = new EventEmitter();

  @Input() showCardNumberExpDate: boolean = true;

  @Input() cardNumber: number | null = null;

  get NameOnCard() {
    return this.formGroup.get('nameOnCard');
  }

  get CardNumber() {
    return this.formGroup.get('cardNumber');
  }

  get CardExp() {
    return this.formGroup.get('cardExp');
  }

  get CVV() {
    return this.formGroup.get('cvv');
  }

  get PhoneNum() {
    return this.formGroup.get('phoneNum');
  }

  get statusID() {
    return this.formGroup.get('statusID');
  }

  get FirstCorner() {
    return this.formGroup.get('corner1');
  }

  get SecondCorner() {
    return this.formGroup.get('corner2');
  }

  get ThirdCorner() {
    return this.formGroup.get('corner3');
  }

  get FourthCorner() {
    return this.formGroup.get('corner4');
  }

  get FirstCornerAmountType() {
    return this.FirstCorner?.get('amountType');
  }

  get SecondCornerAmountType() {
    return this.SecondCorner?.get('amountType');
  }

  get ThirdCornerAmountType() {
    return this.ThirdCorner?.get('amountType');
  }

  get FourthCornerAmountType() {
    return this.FourthCorner?.get('amountType');
  }

  get isCardExpired() {
    return this.CardExp?.value == '12/29';
  }

  get formattedExpDate(): string {
    return this.CardExp?.value ? this.CardExp.value.replace(/^(\d{2})(\d{2})$/, '$1/$2') : '';
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private pageRoutes: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private donorAPi: DonorAPIService
  ) {}

  ngOnInit(): void {
    const init = this.formGroup.value;

    const corner1Val = this.getValueOfSelect(init.corner1.amountType);
    this.changeValidation(this.FirstCorner, init.corner1.amountType, corner1Val);

    const corner2Val = this.getValueOfSelect(init.corner2.amountType);
    this.changeValidation(this.SecondCorner, init.corner2.amountType, corner2Val);

    const corner3Val = this.getValueOfSelect(init.corner3.amountType);
    this.changeValidation(this.FirstCorner, init.corner3.amountType, corner3Val);

    const corner4Val = this.getValueOfSelect(init.corner4.amountType);
    this.changeValidation(this.FourthCorner, init.corner4.amountType, corner4Val);

    this.onUpdateFirstCornerValue();
    this.onUpdateSecondCornerValue();
    this.onUpdateThirdCornerValue();
    this.onUpdateFourthCornerValue();

    if (this.cardNumber) {
      this.CardNumber?.setValue(this.cardNumber);
    }

    this.NameOnCard?.valueChanges.subscribe((v) => {
      if (this.NameOnCard?.dirty && v) {
        this.canSubmit = true;
      }
    });

    this.PhoneNum?.valueChanges.subscribe((v) => {
      if (this.PhoneNum?.dirty && v) {
        this.canSubmit = true;
      }
    });

    this.CardExp?.valueChanges.subscribe((val) => {
      if (val && this.isCardExpired) {
        this.fourthCornerVisited = true;
      }
    });
    if (this.expiry) {
      this.CardExp?.setValue(this.expiry);
    }
    this.getProfilePhoneList();
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  getProfileRouterLink() {
    return this.pageRoutes.getProfileRouterLink();
  }

  private getProfilePhoneList() {
    const userHandle = this.localStorage.getLoginUserUserName();
    this.donorAPi.getProfilePhoneList(userHandle).subscribe((res) => {
      if (!res) {
        return;
      }

      this.phoneList = [...res];

      this.changeDetectorRef.detectChanges();
    });
  }

  isCardLock() {
    return this.statusID?.value === 3;
  }

  nameOnCardEnable() {
    this.NameOnCard?.enable();
  }

  cardPinEnable() {
    this.CVV?.enable();
  }

  setCardCorner(val: number) {
    // is any field is in animation then return default, so same animation can't trigger
    if (this.inAnimation) {
      return;
    }

    if (val === 1 && this.FirstCorner?.invalid) {
      this.openCornerDetails(1);
      return;
    }

    if (val === 2 && this.SecondCorner?.invalid) {
      this.openCornerDetails(2);
      return;
    }

    if (val === 3 && this.ThirdCorner?.invalid) {
      this.openCornerDetails(3);
      return;
    }

    if (val === 4 && this.FourthCorner?.invalid) {
      this.openCornerDetails(4);
      return;
    }

    this.changeDetectorRef.detectChanges();

    if (
      this.FirstCorner?.valid &&
      this.SecondCorner?.valid &&
      this.ThirdCorner?.valid &&
      this.FourthCorner?.valid &&
      this.firstCornerVisited &&
      this.secondCornerVisited &&
      this.thirdCornerVisited &&
      this.fourthCornerVisited
    ) {
      this.allCornerSet.emit(true);
      return;
    }
  }

  /**
   * call this from parent component
   */
  nextCorner() {
    if (
      this.FirstCorner?.valid &&
      this.SecondCorner?.valid &&
      this.ThirdCorner?.valid &&
      this.FourthCorner?.valid &&
      this.firstCornerVisited &&
      this.secondCornerVisited &&
      this.thirdCornerVisited &&
      this.fourthCornerVisited
    ) {
      this.allCornerSet.emit(true);
      return;
    }

    if (!this.firstCornerVisited) {
      this.setCardCorner(1);

      return;
    }

    if (!this.secondCornerVisited) {
      this.setCardCorner(2);
      return;
    }

    if (!this.thirdCornerVisited) {
      this.setCardCorner(3);
      return;
    }

    if (!this.fourthCornerVisited) {
      this.setCardCorner(4);
      return;
    }

    this.setCardCorner(this.cardSelectorCorner);
  }

  setAllVisited() {
    this.firstCornerVisited = true;
    this.secondCornerVisited = true;
    this.thirdCornerVisited = true;
    this.fourthCornerVisited = true;
  }

  /**
   * For Manual Entry
   */
  setFourthCornerVisited() {
    this.fourthCornerVisited = true;
  }

  private autofocusNameOnCardField() {
    setTimeout(() => {
      this.nameOnCardCtrl.nativeElement.focus();
    }, 250);
  }

  toggleCardInfoPanel() {
    this.openInfo = !this.openInfo;
    if (this.openInfo && !this.NameOnCard?.value) {
      this.autofocusNameOnCardField();
    }
  }

  openCardInfoPanel() {
    if (this.cardSettingButton) {
      this.openInfo = true;
      if (!this.NameOnCard?.value) {
        this.autofocusNameOnCardField();
      }
    }
  }

  closeCardInfoPanel() {
    this.openInfo = false;
  }

  getValueOfSelect(val: string) {
    if (val === '2') {
      return '0';
    }

    if (val === '3') {
      return 'Req';
    }

    return '';
  }

  // Input Event

  setupCursor(val: any, viewChild: ElementRef<HTMLInputElement>) {
    if (val && viewChild) {
      const v = val;
      const startAt = v.length;
      const endAt = v.length - 3 < 0 ? 2 : v.length - 3;
      viewChild.nativeElement.setSelectionRange(startAt, endAt, 'backward');
    }
  }

  /**
   * To check if value end with 9
   * example:  09 or 19 or 29
   *
   * @param expiry string | null
   */
  isEndWithNine(expiry: string | null) {
    if (expiry) {
      const character = expiry.trim().charAt(expiry.length - 1);
      return character === '9';
    }

    return false;
  }

  unLockCard() {
    this.canSubmit = true;

    this.formGroup.patchValue({
      statusID: 0,
    });
    this.formGroup.updateValueAndValidity();
  }

  openCardLockModal() {
    this.canSubmit = true;
    this.formGroup.patchValue({
      statusID: 3,
    });
    this.formGroup.updateValueAndValidity();
  }

  openCardReplaceModal() {
    this.replaceThisCard.emit();
  }

  private getCardPinPopup() {
    const tmpModalOptions: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
      size: 'sm',
      windowClass: 'card-pin-pop',
    };

    return this.modalService.open(ChangeCardPinPopupComponent, tmpModalOptions);
  }

  openCardPinPopup() {
    const modalRef = this.getCardPinPopup();
    modalRef.componentInstance.newValue.subscribe((value: string) => {
      this.canSubmit = true;
      this.CVV?.patchValue(value);
      this.formGroup.updateValueAndValidity();
    });
  }

  private checkAllCornerValid() {
    if (this.FirstCorner?.valid && this.SecondCorner?.valid && this.ThirdCorner?.valid && this.FourthCorner?.valid) {
      this.allCornerSet.emit(true);
    }
  }

  onUpdateFirstCornerValue() {
    this.FirstCornerAmountType?.valueChanges.subscribe((val) => {
      const tmp = this.getValueOfSelect(val);
      this.changeValidation(this.FirstCorner, val, tmp);
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
      if (this.FirstCorner?.invalid) {
        this.allCornerSet.emit(false);
      }
      this.checkAllCornerValid();
      this.changeDetectorRef.detectChanges();
    });
  }

  onUpdateSecondCornerValue() {
    this.SecondCornerAmountType?.valueChanges.subscribe((val) => {
      const tmp = this.getValueOfSelect(val);
      this.changeValidation(this.SecondCorner, val, tmp);
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
      if (this.SecondCorner?.invalid) {
        this.allCornerSet.emit(false);
      }
      this.checkAllCornerValid();
      this.changeDetectorRef.detectChanges();
    });
  }

  onUpdateThirdCornerValue() {
    this.ThirdCornerAmountType?.valueChanges.subscribe((val) => {
      const tmp = this.getValueOfSelect(val);
      this.changeValidation(this.ThirdCorner, val, tmp);
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
      if (this.ThirdCorner?.invalid) {
        this.allCornerSet.emit(false);
      }
      this.checkAllCornerValid();
      this.changeDetectorRef.detectChanges();
    });
  }

  onUpdateFourthCornerValue() {
    this.FourthCornerAmountType?.valueChanges.subscribe((val) => {
      const tmp = this.getValueOfSelect(val);
      this.changeValidation(this.FourthCorner, val, tmp);
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
      if (this.FourthCorner?.invalid) {
        this.allCornerSet.emit(false);
      }
      this.checkAllCornerValid();
      this.changeDetectorRef.detectChanges();
    });
  }

  changeValidation(corner: AbstractControl | null, changeType: string, value: string) {
    /**
     * clear all validation for corners
     */
    corner?.get('value')?.clearValidators();

    corner?.get('capPerUser')?.get('attempt1')?.clearValidators();
    corner?.get('capPerUser')?.get('attempt2')?.clearValidators();
    corner?.get('capPerUser')?.get('days')?.clearValidators();

    corner?.get('chargeRandomAmount')?.get('minValue')?.clearValidators();
    corner?.get('chargeRandomAmount')?.get('maxValue')?.clearValidators();
    corner?.get('chargeRandomAmount')?.clearValidators();

    /**
     * after clearing update value and validity so all previous error will remove
     */
    corner?.get('value')?.updateValueAndValidity();
    corner?.get('capPerUser')?.get('attempt1')?.updateValueAndValidity();
    corner?.get('capPerUser')?.get('attempt2')?.updateValueAndValidity();
    corner?.get('capPerUser')?.get('days')?.updateValueAndValidity();
    corner?.get('chargeRandomAmount')?.get('minValue')?.updateValueAndValidity();
    corner?.get('chargeRandomAmount')?.get('maxValue')?.updateValueAndValidity();
    corner?.get('chargeRandomAmount')?.updateValueAndValidity();

    if (changeType === '1' || changeType === '2' || changeType === '3') {
      if (changeType === '1') {
        corner
          ?.get('value')
          ?.setValidators(
            Validators.compose([
              Validators.required,
              Validators.max(9999),
              CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
            ])
          );
      } else {
        corner?.get('value')?.setValidators(Validators.compose([Validators.required]));
      }

      corner?.patchValue({
        value,
      });

      corner?.markAllAsTouched();
      corner?.updateValueAndValidity();
      return;
    }

    if (changeType === '4') {
      corner
        ?.get('capPerUser')
        ?.get('attempt1')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );
      corner
        ?.get('capPerUser')
        ?.get('attempt2')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );

      corner
        ?.get('capPerUser')
        ?.get('days')
        ?.setValidators(Validators.compose([Validators.required]));

      corner?.markAllAsTouched();
      corner?.updateValueAndValidity();
      return;
    }

    if (changeType === '5') {
      corner
        ?.get('chargeRandomAmount')
        ?.get('minValue')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );
      corner
        ?.get('chargeRandomAmount')
        ?.get('maxValue')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );

      corner?.get('chargeRandomAmount')?.setValidators(CustomValidator.crossField('minValue', 'maxValue'));

      corner?.markAllAsTouched();
      corner?.updateValueAndValidity();
    }
  }

  openCornerDetails(cornerId: number) {
    const option: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup donate-popup setting-popup',
      size: 'lg',
      scrollable: true,
    };

    const modalRef = this.modalService.open(MatbiaCardCornerSettingPopupComponent, option);

    if (cornerId === 1) {
      modalRef.componentInstance.initValue = this.FirstCorner?.value;
    }

    if (cornerId === 2) {
      modalRef.componentInstance.initValue = this.SecondCorner?.value;
    }

    if (cornerId === 3) {
      modalRef.componentInstance.initValue = this.ThirdCorner?.value;
    }

    if (cornerId === 4) {
      modalRef.componentInstance.initValue = this.FourthCorner?.value;
    }

    modalRef.componentInstance.cornerId = cornerId;

    modalRef.componentInstance.saveDetails.subscribe((value: any) => {
      if (cornerId === 1) {
        this.FirstCorner?.patchValue(value);
        this.firstCornerVisited = true;
      }

      if (cornerId === 2) {
        this.SecondCorner?.patchValue(value);
        this.secondCornerVisited = true;
      }

      if (cornerId === 3) {
        this.ThirdCorner?.patchValue(value);
        this.thirdCornerVisited = true;
      }

      if (cornerId === 4) {
        this.FourthCorner?.patchValue(value);
        this.fourthCornerVisited = true;
      }

      this.canSubmit = true;
      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });
  }
}
