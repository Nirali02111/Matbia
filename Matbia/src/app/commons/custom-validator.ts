import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BankAccountStatus } from '@enum/BankAccount';
import moment from 'moment';
import { CommonDataService } from './common-data-service.service';

export interface AbstractControlWarning extends AbstractControl {
  warnings?: any;
}

const EMAIL_REGEXP = /\.+([A-Za-z0-9])*$/;
function isEmptyInputValue(value: any): boolean {
  return value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0);
}

export class CustomValidator {
  // Validates US SSN
  static ssnValidator(ssn: any): any {
    if (ssn.pristine) {
      return null;
    }
    const SSN_REGEXP = /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}[-]?(?!00)\d{2}[-]?(?!0{4})\d{4}$/;
    ssn.markAsTouched();
    if (SSN_REGEXP.test(ssn.value)) {
      return null;
    }
    return {
      invalidSsn: true,
    };
  }

  // Validates zip codes
  static zipCodeValidator(zip: any): any {
    if (zip.pristine) {
      return null;
    }
    const ZIP_REGEXP = /^[0-9]{5}(?:-[0-9]{4})?$/;
    zip.markAsTouched();
    if (ZIP_REGEXP.test(zip.value)) {
      return null;
    }
    return {
      invalidZip: true,
    };
  }

  // Validates zip codes
  static age18(dob: any): any {
    if (dob.pristine) {
      return null;
    }

    dob.markAsTouched();

    const generatedDate = moment(dob.value, 'YYYY-MM-DD');

    if (!generatedDate.isValid()) {
      return {
        invalidAge: true,
      };
    }

    const counts = Math.floor(moment(new Date()).diff(generatedDate, 'years', true));

    if (counts > 18 && counts < 125) {
      return null;
    }
    return {
      invalidAge: true,
    };
  }

  static validDocument(c: any): any {
    // if (c.pristine) {
    //   return null;
    // }

    if (c.value) {
      const valToLower = c.value.toLowerCase();
      const regex = new RegExp('(.*?).(jpg|png|jpeg|pdf)$');
      const regexTest = regex.test(valToLower);
      return !regexTest ? { notSupportedFileType: true } : null;
    }

    return null;
  }

  public static greaterThan(
    toCompare: number | string,
    orEquals: boolean = false,
    labelMessage: string = '',
    inSpan: boolean = false,
    optional: boolean = false
  ): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.pristine) {
        return null;
      }

      if (optional && !control.value) {
        return null;
      }

      const condition: boolean = orEquals ? control.value >= toCompare : control.value > toCompare;
      return condition ? null : { greaterThan: { toCompare, labelMessage, inSpan } };
    };
  }

  public static lessThan(
    toCompare: number | string,
    orEquals: boolean = false,
    labelMessage: string = '',
    inSpan: boolean = false,
    optional: boolean = false
  ): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.pristine) {
        return null;
      }

      if (optional && !control.value) {
        return null;
      }

      const condition: boolean = orEquals ? control.value <= toCompare : control.value < toCompare;
      return condition ? null : { lessThan: { toCompare, labelMessage, inSpan } };
    };
  }

  public static MisMatch(otherInputControl: AbstractControl | null): ValidatorFn {
    return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
      if (
        inputControl.value !== undefined &&
        inputControl.value.trim() !== '' &&
        inputControl.value !== otherInputControl?.value
      ) {
        return { mismatch: true };
      }

      return null;
    };
  }

  public static greaterThanField(otherFieldName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const otherF = control.parent?.get(otherFieldName);

      if (!control.value || !otherF?.value) {
        return { greaterThanField: true };
      }

      const val = Number(control.value);
      const otherVal = Number(otherF?.value);

      if (val < otherVal) {
        return { greaterThanField: true };
      }

      return null;
    };
  }

  public static lessThanField(otherFieldName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const otherF = control.parent?.get(otherFieldName);

      if (!control.value || !otherF?.value) {
        return { lessThanField: true };
      }

      const val = Number(control.value);
      const otherVal = Number(otherF?.value);

      if (val > otherVal) {
        return { lessThanField: true };
      }

      return null;
    };
  }

  public static crossField(fieldOne: string, fieldTwo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const controlOne = control.get(fieldOne);
      const controlTwo = control.get(fieldTwo);

      return controlOne && controlTwo && Number(controlOne.value) >= Number(controlTwo.value)
        ? { crossField: true }
        : null;
    };
  }

  public static requiredNoWhiteSpace(labelMessage = ''): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.pristine) {
        return null;
      }

      const condition = Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)(control);
      return !condition ? null : { whiteSpace: { labelMessage } };
    };
  }

  public static noHebrew(labelMessage = ''): ValidatorFn {
    return (control: AbstractControlWarning) => {
      const condition = Validators.pattern(/[\u0590-\u05FF\u05BC]/gi)(control);

      return !condition && control.value ? { hebrewFound: { labelMessage } } : null;
    };
  }

  public static email(): ValidatorFn {
    return (control: AbstractControlWarning) => {
      if (isEmptyInputValue(control.value)) {
        return null;
      }

      const condition = Validators.email(control);

      return condition ? condition : EMAIL_REGEXP.test(control.value) ? null : { email: true };
    };
  }

  public static bankAccountInactive(linkedAccountList: Array<any>): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return { accountInactive: true };
      }

      const selectedAccount = linkedAccountList.find((o) => {
        return o.bankAccountId === control.value;
      });

      const condition =
        selectedAccount &&
        selectedAccount.accountStatus &&
        selectedAccount.accountStatus === BankAccountStatus.INACTIVE;

      if (condition) {
        return { accountInactive: true };
      }

      return null;
    };
  }

  public static strongPassword(): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.pristine) {
        return null;
      }

      const lengthCondition = Validators.minLength(8)(control);
      const numberCondition = Validators.pattern(/\d/)(control);
      const upperCaseCondition = Validators.pattern(/[A-Z]/)(control);
      const lowerCaseCondition = Validators.pattern(/[a-z]/)(control);
      const specialCondition = Validators.pattern(/[$@#!%*?&^]/)(control);

      if (lengthCondition || numberCondition || upperCaseCondition || lowerCaseCondition || specialCondition) {
        return {
          strongPassword: {
            isLengthInvalid: lengthCondition ? true : false,
            isNumberInvalid: numberCondition ? true : false,
            isUpperCaseInvalid: upperCaseCondition ? true : false,
            isLowerCaseInvalid: lowerCaseCondition ? true : false,
            isSpecialCharacterInvalid: specialCondition ? true : false,
          },
        };
      }

      return null;
    };
  }

  public static cardValidator(commonService: CommonDataService): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      if (commonService.luhnCheck(value)) {
        return null;
      } else {
        return { invalidCardNumber: true };
      }
    };
  }
}
