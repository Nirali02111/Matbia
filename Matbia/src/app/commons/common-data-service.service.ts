import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { Injectable, signal } from '@angular/core';
import { RequestStatus, RequestType } from '@enum/Request';
import { TransactionStatus, TransactionTypes } from '@enum/Transaction';
import moment from 'moment-timezone';
import { MatbiaObserverService } from './matbia-observer.service';
import { isEqual } from 'lodash-es';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
const TIME_ZONE = 'America/New_York';

@Injectable({
  providedIn: 'root',
})
export class CommonDataService {
  // tslint:disable-next-line: no-inferrable-types
  EXCHANGE_RATE: number = 100;
  cardThroughEmail: boolean = false;
  notCardThroughEmail: boolean = false;
  isUpdateInfoPopupOpen = signal<boolean>(false);
  updateInfoPopupRef = signal<NgbModalRef | null>(null);

  stateList = [
    { item_id: 'AL', item_text: 'Alabama' },
    { item_id: 'AK', item_text: 'Alaska' },
    { item_id: 'AZ', item_text: 'Arizona' },
    { item_id: 'AR', item_text: 'Arkansas' },
    { item_id: 'CA', item_text: 'California' },
    { item_id: 'CO', item_text: 'Colorado' },
    { item_id: 'CT', item_text: 'Connecticut' },
    { item_id: 'DE', item_text: 'Delaware' },
    { item_id: 'DC', item_text: 'District Of Columbia' },
    { item_id: 'FL', item_text: 'Florida' },
    { item_id: 'GA', item_text: 'Georgia' },
    { item_id: 'HI', item_text: 'Hawaii' },
    { item_id: 'ID', item_text: 'Idaho' },
    { item_id: 'IL', item_text: 'Illinois' },
    { item_id: 'IN', item_text: 'Indiana' },
    { item_id: 'IA', item_text: 'Iowa' },
    { item_id: 'KS', item_text: 'Kansas' },
    { item_id: 'KY', item_text: 'Kentucky' },
    { item_id: 'LA', item_text: 'Louisiana' },
    { item_id: 'ME', item_text: 'Maine' },
    { item_id: 'MD', item_text: 'Maryland' },
    { item_id: 'MA', item_text: 'Massachusetts' },
    { item_id: 'MI', item_text: 'Michigan' },
    { item_id: 'MN', item_text: 'Minnesota' },
    { item_id: 'MS', item_text: 'Mississippi' },
    { item_id: 'MO', item_text: 'Missouri' },
    { item_id: 'MT', item_text: 'Montana' },
    { item_id: 'NE', item_text: 'Nebraska' },
    { item_id: 'NV', item_text: 'Nevada' },
    { item_id: 'NH', item_text: 'New Hampshire' },
    { item_id: 'NJ', item_text: 'New Jersey' },
    { item_id: 'NM', item_text: 'New Mexico' },
    { item_id: 'NY', item_text: 'New York' },
    { item_id: 'NC', item_text: 'North Carolina' },
    { item_id: 'ND', item_text: 'North Dakota' },
    { item_id: 'OH', item_text: 'Ohio' },
    { item_id: 'OK', item_text: 'Oklahoma' },
    { item_id: 'OR', item_text: 'Oregon' },
    { item_id: 'PA', item_text: 'Pennsylvania' },
    { item_id: 'RI', item_text: 'Rhode Island' },
    { item_id: 'SC', item_text: 'South Carolina' },
    { item_id: 'SD', item_text: 'South Dakota' },
    { item_id: 'TN', item_text: 'Tennessee' },
    { item_id: 'TX', item_text: 'Texas' },
    { item_id: 'UT', item_text: 'Utah' },
    { item_id: 'VT', item_text: 'Vermont' },
    { item_id: 'VA', item_text: 'Virginia' },
    { item_id: 'WA', item_text: 'Washington' },
    { item_id: 'WV', item_text: 'West Virginia' },
    { item_id: 'WI', item_text: 'Wisconsin' },
    { item_id: 'WY', item_text: 'Wyoming' },
  ];

  requestStatusList = [
    {
      id: 'All',
      label: 'All',
    },

    {
      id: RequestStatus.PENDING,
      label: 'Open',
    },
    {
      id: RequestStatus.SNOOZED,
      label: 'Snoozed',
    },
    {
      id: RequestStatus.FULFILLED,
      label: 'Completed',
    },
  ];

  transactionStatusList = [
    {
      id: 'All',
      label: 'All',
    },
    {
      id: TransactionStatus.SUCCESS,
      label: TransactionStatus.SUCCESS,
    },
    {
      id: TransactionStatus.FUNDING,
      label: TransactionStatus.FUNDING,
    },
    {
      id: TransactionStatus.PENDING,
      label: TransactionStatus.PENDING,
    },
    {
      id: TransactionStatus.GENERATED,
      label: TransactionStatus.GENERATED,
    },
    {
      id: TransactionStatus.FAILED,
      label: TransactionStatus.FAILED,
    },
    {
      id: TransactionStatus.CANCELLED,
      label: TransactionStatus.CANCELLED,
    },
    {
      id: TransactionStatus.VOIDED,
      label: TransactionStatus.VOIDED,
    },
    {
      id: TransactionStatus.DECLINED,
      label: TransactionStatus.DECLINED,
    },
    {
      id: TransactionStatus.EXPIRED,
      label: TransactionStatus.EXPIRED,
    },
    {
      id: TransactionStatus.SUBMITTED,
      label: TransactionStatus.SUBMITTED,
    },
  ];

  requestTypeList = [
    {
      id: RequestType.CARD,
      label: 'Card',
    },
    {
      id: RequestType.TOKEN,
      label: 'Token',
    },
    {
      id: 'All',
      label: 'All',
    },
  ];

  transactionTypeList = [
    {
      id: TransactionTypes.REFUND,
      label: 'Refund',
    },
    {
      id: TransactionTypes.DEPOSIT,
      label: 'Deposits',
    },
    {
      id: TransactionTypes.DONATION,
      label: 'Donations',
    },
    {
      id: TransactionTypes.FAILED_DEPOSIT,
      label: 'Fee',
    },
    {
      id: 'All',
      label: 'All',
    },
  ];

  ORGtransactionTypeList = [
    {
      id: 'All',
      label: 'All',
    },
    {
      id: TransactionTypes.REDEEMED_And_MATBIA_FEE,
      label: 'Redeems/Fees',
    },
    {
      id: TransactionTypes.DONATION,
      label: 'Donations',
    },
    {
      id: TransactionTypes.REFUND,
      label: 'Refund',
    },
  ];
  screenshotImage: string | null = null;

  constructor(public localStorageDataService: LocalStorageDataService, private matbiaObserver: MatbiaObserverService) {}

  isStringTrue(value: string) {
    return String(value).toLowerCase() === 'true' ? true : false;
  }

  getUSStateList() {
    return this.stateList;
  }

  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
  }

  getUSDTOSila(amount: number): number {
    return amount * this.EXCHANGE_RATE;
  }

  getSilaToUSD(amount: number): number {
    return amount / this.EXCHANGE_RATE;
  }

  private getValidAmountString(inputValue: string) {
    return inputValue.replace(/,/g, '');
  }

  getNumberWithFormate(inputValue: string) {
    const str = this.getValidAmountString(inputValue);
    const term = Number(str);
    return isNaN(term) ? '0.00' : term.toFixed(2);
  }

  private convertUTCToTimezone(utcDt: moment.MomentInput, timezone: string) {
    return moment.utc(utcDt).tz(timezone);
  }

  getUTCFromEST(date: string) {
    return moment.utc(moment.tz(date, TIME_ZONE)).toDate();
  }

  getESTFromUTC(date: string) {
    return this.convertUTCToTimezone(date, TIME_ZONE);
  }

  getEST(date: string) {
    return moment(date).tz(TIME_ZONE);
  }

  getPreviewDate(startDate: any, addIn: number, frequency: number) {
    if (frequency === 1) {
      return moment(startDate).add(addIn, 'days');
    }
    if (frequency === 2) {
      return moment(startDate).add(addIn, 'weeks');
    }
    if (frequency === 3) {
      return moment(startDate).add(addIn * 2, 'weeks');
    }
    if (frequency === 4) {
      return moment(startDate).add(addIn, 'months');
    }
    if (frequency === 5) {
      return moment(startDate).add(addIn, 'years');
    }

    return moment(startDate);
  }

  isEntityId() {
    const isEntityId = this.localStorageDataService.getEntityTokenSetting();
    const emptyTokenres: any = {
      totalAmount: null,
      totalGenerated: null,
      totalProcessed: null,
      tokens: null,
    };
    // Using Lodash to compare objects
    const isresEqual = isEqual(isEntityId, emptyTokenres);
    if (isresEqual) {
      return false;
    }
    return true;
  }
  luhnCheck(cardNo: string): boolean {
    cardNo = cardNo?.replace(/[-\s]/g, '');
    const isLengthValid = typeof cardNo === 'string' && cardNo.length >= 13 && cardNo.length <= 19;
    const isNumeric = /^\d+$/.test(cardNo);
    if (!isLengthValid || !isNumeric) {
      return false;
    }
    var s = 0;
    var doubleDigit = false;
    for (var i = cardNo.length - 1; i >= 0; i--) {
      var digit = +cardNo[i];
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      s += digit;
      doubleDigit = !doubleDigit;
    }

    return s % 10 == 0;
  }
}
