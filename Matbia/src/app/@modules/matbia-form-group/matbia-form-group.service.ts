import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Moment } from 'moment';
import { CustomValidator } from '@commons/custom-validator';

export interface BankAndCreditCard {
  optionType: string;
  accountType: string;
  accountName: string;
  routingNumber: string;
  accountNumber: string;
  confirmNumber: string;
  nameOnCard: string;
  cardNumber: string;
  cardExp: string;
  cvv: string;
  checkType: string;
}

export interface MatbiaCardFormGroup {
  cardId: string;
  nameOnCard: string;
  cardNumber: string;
  cardExp: string;
  cvv: string;
  phoneNum: string;
  statusID: number | null;

  corner1: string;
  corner2: string;
  corner3: string;
  corner4: string;
  pin: string;
}

interface CapPerUser {
  attempt1: string;
  attempt2: string;
  attempt3: string;
  attempt4: string;
  days: string;
}

interface ChargeRandomAmount {
  minValue: string;
  maxValue: string;
}

export interface AddFundFormGroup {
  isRecurring: boolean;
  isDonate: boolean;
  userHandle: string;
  amount: number | null;
  bankAccountId: string | null;
  transDate: string | null | Moment;
  transferNowAmount: number | null;
  isNotifyOnEmail: boolean;
  isNotifyOnSMS: boolean;
  recurringPayment: {
    count: number | null;
    amount: number | null;
    frequency: number | null;
    scheduleDate: number | null;
  };
  note?: string | null;
}

export interface BusinessRegisterFormGroup {
  businessName: string | null;
  orgJewishName: string | null;
  businessType: string | null;
  businessWebsite: string | null;
  doingBusinessAs: string | null;
  naicsCode: number | null;
  phone: string | null;
  officePhone: string | null;
  businessEmail: string | null;
  employerId: string | null;
  address: string | null;

  city: string | null;
  state: string | null;
  zip: string | null;

  address2?: string | null;
  naics?: string | null;
  businessHandle?: string | null;
}

export interface BusinessUserFormGroup {
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  apt: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  email: string | null;
  phone: string | null;
  cellPhone: string | null;
  birthDate: string | null;
  ssn: string | null;
}

export interface DonorProfileFormGroup {
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  apt: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  email: string | null;
  phone: string | null;
  cellPhone: string | null;

  isBusinessAccount: boolean;
  businessName: string | null;
  taxId: string | null;
  heardAboutUs: string | null;
  pin: any | null;
  cardNum: number | null;
}

export interface OrganizationProfileFormGroup {
  dba: string | null;
  taxId: string | null;
  orgLegalName: string | null;
  yiddishDisplayName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  cellPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  legalAddress: string | null;
  legalCity: string | null;
  legalState: string | null;
  legalZip: string | null;

  orgLogoBase64: string | null;
  ownerIdAttachmentBase64: string | null;
  orgIdAttachmentBase64: string | null;

  ownerName: string | null;
  ownerPhoneNumber: string | null;
  ownerPhoneExt: string | null;
  ownerEmail: string | null;
  fromEntityId: string | number | null;
  isMailingAddress: boolean;
}

@Injectable()
export class MatbiaFormGroupService {
  constructor(private fb: UntypedFormBuilder) {}

  matchAccountNumber(): ValidatorFn {
    return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
      if (
        inputControl.value !== undefined &&
        inputControl.value.trim() !== '' &&
        inputControl.value !== inputControl.parent?.get('accountNumber')?.value
      ) {
        return { mismatch: true };
      }

      return null;
    };
  }

  initBankAndCreditCard(initValue: BankAndCreditCard): UntypedFormGroup {
    if (initValue.optionType === 'bank') {
      return this.fb.group({
        optionType: this.fb.control(initValue.optionType, Validators.compose([Validators.required])),
        accountType: this.fb.control(initValue.accountType, Validators.compose([Validators.required])),
        accountName: this.fb.control(initValue.accountName, Validators.compose([Validators.required])),
        routingNumber: this.fb.control(initValue.routingNumber, Validators.compose([Validators.required])),
        accountNumber: this.fb.control(initValue.accountNumber, Validators.compose([Validators.required])),
        confirmNumber: this.fb.control(
          initValue.confirmNumber,
          Validators.compose([Validators.required, this.matchAccountNumber()])
        ),

        checkType: this.fb.control(initValue.checkType, Validators.compose([Validators.required])),

        nameOnCard: this.fb.control(initValue.nameOnCard),
        cardNumber: this.fb.control(initValue.cardNumber),
        cardExp: this.fb.control(initValue.cardExp),
        cvv: this.fb.control(initValue.cvv),
      });
    }

    return this.fb.group({
      optionType: this.fb.control(initValue.optionType),
      accountType: this.fb.control(initValue.accountType),
      accountName: this.fb.control(initValue.accountName),
      routingNumber: this.fb.control(initValue.routingNumber),
      accountNumber: this.fb.control(initValue.accountNumber),
      confirmNumber: this.fb.control(initValue.confirmNumber),

      nameOnCard: this.fb.control(initValue.nameOnCard),
      cardNumber: this.fb.control(initValue.cardNumber, Validators.compose([Validators.required])),
      cardExp: this.fb.control(initValue.cardExp, Validators.compose([Validators.required])),
      cvv: this.fb.control(initValue.cvv, Validators.compose([Validators.required])),
    });
  }

  private initCapPerUserFormGroup(initValue: CapPerUser) {
    return this.fb.group({
      attempt1: this.fb.control(
        initValue.attempt1,
        Validators.compose([
          Validators.required,
          CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
        ])
      ),
      attempt2: this.fb.control(
        initValue.attempt2,
        Validators.compose([
          Validators.required,
          CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
        ])
      ),
      attempt3: this.fb.control(
        initValue.attempt3,
        Validators.compose([CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true)])
      ),
      attempt4: this.fb.control(
        initValue.attempt4,
        Validators.compose([CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true)])
      ),
      days: this.fb.control(initValue.days, Validators.compose([Validators.required])),
    });
  }

  private initChargeRandomAmountFormGroup(initValue: ChargeRandomAmount) {
    return this.fb.group(
      {
        minValue: this.fb.control(
          initValue.minValue,
          Validators.compose([
            Validators.required,
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        ),
        maxValue: this.fb.control(
          initValue.maxValue,
          Validators.compose([
            Validators.required,
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        ),
      },
      { validators: CustomValidator.crossField('minValue', 'maxValue') }
    );
  }

  isManualEntryOnDevice(val: string): boolean {
    return val === '0';
  }

  isSendRequestToPortal(val: string): boolean {
    return val === 'Req';
  }

  isSetupCapPerUser(val: string) {
    return val && val.includes('Cap-');
  }

  isChangeRandomAmount(val: string) {
    return val && val.includes('Rand-');
  }

  getAmountTypeValue(val: string) {
    if (this.isManualEntryOnDevice(val)) {
      return '2';
    }

    if (this.isSendRequestToPortal(val)) {
      return '3';
    }

    if (this.isSetupCapPerUser(val)) {
      return '4';
    }

    if (this.isChangeRandomAmount(val)) {
      return '5';
    }

    return '1';
  }

  public getCornerValidValue(val: string) {
    const amountType = this.getAmountTypeValue(val);
    const cpInt = {
      attempt1: '',
      attempt2: '',
      attempt3: '',
      attempt4: '',
      days: '',
    };

    const chInt = {
      minValue: '',
      maxValue: '',
    };

    if (amountType === '4') {
      const arr = val.split('-');
      if (arr && arr.length !== 0 && arr.length >= 3) {
        const capValues = arr[1].split(',');
        cpInt.attempt1 = capValues[0] || '';
        cpInt.attempt2 = capValues[1] || '';
        cpInt.attempt3 = capValues[2] || '';
        cpInt.attempt4 = capValues[3] || '';
        cpInt.days = arr[2] || '';
      }
      return {
        amountType,
        value: '',
        capPerUser: cpInt,
        chargeRandomAmount: chInt,
      };
    }

    if (amountType === '5') {
      const arr = val.split('-');
      if (arr && arr.length !== 0 && arr.length >= 2) {
        const changeValues = arr[1].split(',');
        chInt.minValue = changeValues[0];
        chInt.maxValue = changeValues[1];
      }

      return {
        amountType,
        value: '',
        capPerUser: cpInt,
        chargeRandomAmount: chInt,
      };
    }

    return {
      amountType,
      value: val,
      capPerUser: cpInt,
      chargeRandomAmount: chInt,
    };
  }

  public buildCornerValue(obj: {
    amountType: string;
    value: string;
    capPerUser: CapPerUser;
    chargeRandomAmount: ChargeRandomAmount;
  }) {
    if (obj.amountType === '4') {
      return `Cap-${obj.capPerUser.attempt1},${obj.capPerUser.attempt2},${obj.capPerUser.attempt3},${obj.capPerUser.attempt4}-${obj.capPerUser.days}`;
    }

    if (obj.amountType === '5') {
      return `Rand-${obj.chargeRandomAmount.minValue},${obj.chargeRandomAmount.maxValue}`;
    }

    return obj.value;
  }

  initDonorRegisterFormGroup(initValue: DonorProfileFormGroup) {
    return this.fb.group({
      data_input_field_1: this.fb.control(
        initValue.firstName,
        Validators.compose([Validators.required, CustomValidator.noHebrew()])
      ),
      data_input_field_2: this.fb.control(
        initValue.lastName,
        Validators.compose([Validators.required, CustomValidator.noHebrew()])
      ),
      data_input_field_3: this.fb.control(
        initValue.address,
        Validators.compose([Validators.required, CustomValidator.noHebrew()])
      ),
      apt: this.fb.control(initValue.city, Validators.compose([])),
      city: this.fb.control(initValue.city, Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      state: this.fb.control(initValue.state, Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      zip: this.fb.control(
        initValue.zip,
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      ),
      email: this.fb.control(initValue.email, Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      phone: this.fb.control(initValue.phone, Validators.compose([])),
      cellPhone: this.fb.control(initValue.cellPhone, Validators.compose([Validators.required])),

      profileImage: this.fb.group({
        fileName: this.fb.control(''),
        fileBase64: this.fb.control(''),
      }),

      isBusinessAccount: this.fb.control(initValue.isBusinessAccount),
      businessName: this.fb.control(initValue.businessName, Validators.compose([])),
      taxId: this.fb.control(initValue.taxId, Validators.compose([])),
      heardAboutUs: this.fb.control(initValue.heardAboutUs, Validators.compose([Validators.required])),
      pin: this.fb.control(''),
      cardNum: this.fb.control(''),
    });
  }

  initOrganizationRegisterFormGroup(initValue: OrganizationProfileFormGroup) {
    return this.fb.group({
      dba: this.fb.control(initValue.dba, Validators.compose([])),
      taxId: this.fb.control(initValue.taxId, Validators.compose([Validators.required])),
      orgLegalName: this.fb.control(initValue.orgLegalName, Validators.compose([Validators.required])),
      yiddishDisplayName: this.fb.control(initValue.yiddishDisplayName, Validators.compose([])),

      displayName: this.fb.control(initValue.displayName, Validators.compose([Validators.required])),

      email: this.fb.control(initValue.email, Validators.compose([Validators.required, Validators.email])),
      phone: this.fb.control(initValue.phone, Validators.compose([])),
      cellPhone: this.fb.control(initValue.cellPhone, Validators.compose([])),

      data_input_field_1: this.fb.control(initValue.address, Validators.compose([Validators.required])),
      city: this.fb.control(initValue.city, Validators.compose([Validators.required])),
      state: this.fb.control(initValue.state, Validators.compose([Validators.required])),
      zip: this.fb.control(
        initValue.zip,
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      ),

      data_input_field_2: this.fb.control(initValue.legalAddress, Validators.compose([Validators.required])),
      legalCity: this.fb.control(initValue.legalCity, Validators.compose([Validators.required])),
      legalState: this.fb.control(initValue.legalState, Validators.compose([Validators.required])),
      legalZip: this.fb.control(
        initValue.legalZip,
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      ),

      orgLogoImage: this.fb.group({
        orgLogoFileName: this.fb.control(''),
        orgLogoBase64: this.fb.control(''),
      }),

      ownerIdAttachment: this.fb.group({
        ownerIdAttachmentFileName: this.fb.control(
          '',
          Validators.compose([Validators.required, CustomValidator.validDocument])
        ),
        ownerIdAttachmentBase64: this.fb.control('', Validators.compose([Validators.required])),
      }),

      orgIdAttachment: this.fb.group({
        orgIdAttachmentFileName: this.fb.control(
          '',
          Validators.compose([Validators.required, CustomValidator.validDocument])
        ),
        orgIdAttachmentBase64: this.fb.control('', Validators.compose([Validators.required])),
      }),

      ownerName: this.fb.control(initValue.ownerName, Validators.compose([Validators.required])),
      ownerPhoneNumber: this.fb.control(initValue.ownerPhoneNumber, Validators.compose([Validators.required])),
      ownerPhoneExt: this.fb.control(initValue.ownerPhoneExt, Validators.compose([])),
      ownerEmail: this.fb.control(initValue.ownerEmail, Validators.compose([Validators.required, Validators.email])),
      fromEntityId: this.fb.control(initValue.fromEntityId),
      isMailingAddress: this.fb.control(initValue.isMailingAddress),
    });
  }

  initSendMeCardFormGroup() {
    return this.fb.group({
      fullName: this.fb.control('', Validators.compose([Validators.required])),
      mailingAddress: this.fb.control('', Validators.compose([Validators.required])),
      apt: this.fb.control('', Validators.compose([])),
      cityStateZip: this.fb.control('', Validators.compose([Validators.required])),
      phone: this.fb.control(''),
    });
  }

  initMatbiaCardFormGroup(initValue: MatbiaCardFormGroup) {
    const corner1Values = this.getCornerValidValue(initValue.corner1);
    const corner2Values = this.getCornerValidValue(initValue.corner2);
    const corner3Values = this.getCornerValidValue(initValue.corner3);
    const corner4Values = this.getCornerValidValue(initValue.corner4);

    return this.fb.group({
      cardId: this.fb.control(initValue.cardId),
      nameOnCard: this.fb.control(initValue.nameOnCard),
      cardNumber: this.fb.control(initValue.cardNumber, Validators.compose([Validators.required])),
      cardExp: this.fb.control(initValue.cardExp, Validators.compose([])),
      cvv: this.fb.control(initValue.cvv, Validators.compose([Validators.required])),
      pin: this.fb.control(initValue.pin),
      phoneNum: this.fb.control(initValue.phoneNum),

      statusID: this.fb.control(initValue.statusID),

      corner1: this.fb.group({
        amountType: this.fb.control(corner1Values.amountType),
        value: this.fb.control(corner1Values.value, Validators.compose([Validators.required])),
        capPerUser: this.initCapPerUserFormGroup(corner1Values.capPerUser),
        chargeRandomAmount: this.initChargeRandomAmountFormGroup(corner1Values.chargeRandomAmount),
      }),
      corner2: this.fb.group({
        amountType: this.fb.control(corner2Values.amountType),
        value: this.fb.control(corner2Values.value, Validators.compose([Validators.required])),
        capPerUser: this.initCapPerUserFormGroup(corner2Values.capPerUser),
        chargeRandomAmount: this.initChargeRandomAmountFormGroup(corner2Values.chargeRandomAmount),
      }),
      corner3: this.fb.group({
        amountType: this.fb.control(corner3Values.amountType),
        value: this.fb.control(corner3Values.value, Validators.compose([Validators.required])),
        capPerUser: this.initCapPerUserFormGroup(corner3Values.capPerUser),
        chargeRandomAmount: this.initChargeRandomAmountFormGroup(corner3Values.chargeRandomAmount),
      }),
      corner4: this.fb.group({
        amountType: this.fb.control(corner4Values.amountType),
        value: this.fb.control(corner4Values.value, Validators.compose([Validators.required])),
        capPerUser: this.initCapPerUserFormGroup(corner4Values.capPerUser),
        chargeRandomAmount: this.initChargeRandomAmountFormGroup(corner4Values.chargeRandomAmount),
      }),
    });
  }

  initCorner(initCorner: string) {
    const cornerValues = this.getCornerValidValue(initCorner);
    return this.fb.group({
      amountType: this.fb.control(cornerValues.amountType),
      value: this.fb.control(cornerValues.value, Validators.compose([Validators.required])),
      capPerUser: this.initCapPerUserFormGroup(cornerValues.capPerUser),
      chargeRandomAmount: this.initChargeRandomAmountFormGroup(cornerValues.chargeRandomAmount),
    });
  }

  initAddFundFormGroup(initValue: AddFundFormGroup) {
    return this.fb.group({
      isRecurring: this.fb.control(initValue.isRecurring),
      isDonate: this.fb.control(initValue.isDonate),
      userHandle: this.fb.control(initValue.userHandle, Validators.compose([Validators.required])),
      amount: this.fb.control(
        initValue.amount,
        Validators.compose(
          initValue.isDonate
            ? [Validators.required, CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true)]
            : [Validators.required, CustomValidator.greaterThan(20, true, 'Starting amount is $20', true)]
        )
      ),
      bankAccountId: this.fb.control(
        initValue.bankAccountId,
        Validators.compose(initValue.isDonate ? [] : [Validators.required])
      ),
      transDate: this.fb.control(initValue.transDate, Validators.compose([Validators.required])),
      transferNowAmount: this.fb.control(initValue.transferNowAmount),
      note: this.fb.control(''),
      isNotifyOnEmail: this.fb.control(initValue.isNotifyOnEmail),
      isNotifyOnSMS: this.fb.control(initValue.isNotifyOnSMS),
      recurringPayment: this.fb.group({
        count: this.fb.control(initValue.recurringPayment.count),
        amount: this.fb.control(initValue.recurringPayment.amount),
        frequency: this.fb.control(initValue.recurringPayment.frequency),
        alwaysRecurring: this.fb.control(initValue.recurringPayment.count === -1 ? true : false),
      }),

      isImmediateFunding: this.fb.control(false),
    });
  }

  initBusinessRegister(initValue: BusinessRegisterFormGroup) {
    return this.fb.group({
      businessType: [initValue.businessType, Validators.compose([Validators.required])],
      naics: [initValue.naics, Validators.compose([Validators.required])],
      naicsCode: [initValue.naicsCode, Validators.compose([Validators.required])],

      businessName: [initValue.businessName, Validators.compose([Validators.required, CustomValidator.noHebrew()])],
      orgJewishName: [initValue.orgJewishName, Validators.compose([Validators.required])],
      address: [initValue.address, Validators.compose([Validators.required, Validators.minLength(3)])],
      address2: [initValue.address2, Validators.compose([Validators.minLength(3)])],
      city: [initValue.city, Validators.compose([Validators.required])],
      state: [initValue.state, Validators.compose([Validators.required])],
      zip: [initValue.zip, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])],

      employerId: [
        initValue.employerId,
        Validators.compose([Validators.required, Validators.pattern(/^\d{2}-?\d{7}$/)]),
      ],

      businessEmail: [initValue.businessEmail, Validators.compose([Validators.required, CustomValidator.email()])],
      phone: [initValue.phone, Validators.compose([Validators.required])],
      officePhone: [initValue.officePhone, Validators.compose([Validators.required])],

      doingBusinessAs: [initValue.doingBusinessAs],
      businessWebsite: [
        initValue.businessWebsite,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i
          ),
        ]),
      ],
      isAggree: [false],
    });
  }

  initBusinessUser(initValue: BusinessUserFormGroup) {
    return this.fb.group({
      firstName: [initValue.firstName, Validators.compose([Validators.required])],
      lastName: [initValue.lastName, Validators.compose([Validators.required])],
      address: [initValue.address, Validators.compose([Validators.required])],
      apt: [initValue.apt],
      city: [initValue.city, Validators.compose([Validators.required])],
      state: [initValue.state, Validators.compose([Validators.required])],
      zip: [initValue.zip, Validators.compose([Validators.required])],
      email: [initValue.email, Validators.compose([Validators.required, CustomValidator.email()])],
      phone: [initValue.phone, Validators.compose([Validators.required])],
      cellPhone: [initValue.cellPhone, Validators.compose([Validators.required])],
      birthDate: [initValue.birthDate, Validators.compose([Validators.required])],
      ssn: [initValue.ssn, Validators.compose([Validators.required, CustomValidator.ssnValidator])],
    });
  }

  initBusinessPermissions(initValue: { businessHandle: string | null }) {
    return this.fb.group({
      businessHandle: [initValue.businessHandle, Validators.compose([Validators.required])],
      admins: [[], Validators.compose([Validators.required])],
      controllingOfficers: [[], Validators.compose([Validators.required])],
      beneficial_owner_list: [[], Validators.compose([Validators.required])],
      benificialOwners: this.fb.array([]),
    });
  }

  addBeneficial(initValue: { fullName: string; ownershipStake: number | null; handle: string }) {
    return this.fb.group({
      userHandle: this.fb.control(initValue.handle, Validators.compose([Validators.required])),
      ownershipStake: this.fb.control(initValue.ownershipStake, Validators.compose([Validators.required])),
      fullName: this.fb.control(initValue.fullName, Validators.compose([Validators.required])),
    });
  }

  initRedeemFundsFormGroup() {
    return this.fb.group({
      handle: this.fb.control('', Validators.compose([Validators.required])),
      bankAccountId: this.fb.control(null, Validators.compose([Validators.required])),
      totalAmount: this.fb.control(
        '',
        Validators.compose([Validators.required, CustomValidator.greaterThan(20, true, 'Starting amount is $20', true)])
      ),

      isSchedule: this.fb.control(false),
    });
  }
}
