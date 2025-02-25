import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SilaError } from 'src/app/models/login-model';

import {
  GatewayResponse,
  GetOrganizationTransactionPayload,
  OrganizationTransactionObj,
  RecurringObj,
} from 'src/app/models/panels';

export interface OrgTransactionResponse {
  transactions: Array<OrganizationTransactionObj>;
  availableBalance: number;
  presentBalance: number;
  fundingBalance: number;
}

export interface RedeemPayload {
  handle: string;
  bankAccountId: string;
  totalAmount: number;
  createdBy: number;
}

export interface ScheduleRedeemPayload {
  recurringPayment: RecurringObj;
  isNotifyEmail?: boolean;
  isNotifySMS?: boolean;
  bankAccountId: string;
}

export interface RedeemResponse {
  isSilaTransSucceed: true;
  gatewayResponse: GatewayResponse;
  isDBTransSucceed: boolean;
  depositAvailable: string;
  status: string;
  error: Array<SilaError> | null;
  dbTransId: number;

  orgTransferResponse: {
    isSilaTransSucceed: false;
    gatewayResponse: null;
    isDBTransSucceed: false;
    status: null;
    error: Array<SilaError> | null;
    dbTransId: null;
    donaryErrorResponse: null;
    depositAvailable: null;
  };
  feeTransferResponse: {
    isSilaTransSucceed: false;
    gatewayResponse: null;
    isDBTransSucceed: false;
    status: null;
    error: Array<SilaError> | null;
    dbTransId: null;
    donaryErrorResponse: null;
    depositAvailable: null;
  };
  achTransResponse: {
    isSilaTransSucceed: false;
    gatewayResponse: null;
    isDBTransSucceed: false;
    status: null;
    error: Array<SilaError> | null;
    dbTransId: null;
    donaryErrorResponse: null;
    depositAvailable: null;
  };
}

export interface MatbiaCardDonationPayload {
  amount: number;
  cardNum: string;
  exp: string;
  orgHandle: string;
  transDate: string;
  recurringPayment?: RecurringObj;
  note?: string;
  isNotifyOnEmail?: boolean;
  isNotifyOnSMS?: boolean;
}

export interface MatbiaCardDonationResponse {
  isSilaTransSucceed: true;
  gatewayResponse: GatewayResponse;
  isDBTransSucceed: boolean;
  depositAvailable: string;
  status: string;
  error: Array<SilaError>;
  dbTransId: number;
  encryptedDbTransId: string;
  donaryErrorResponse: null | string;
}

export interface BatchPayload {
  handle: string;
  bankAccountId: string;
  createdBy: number;
}

export interface BatchTransactionResponse {
  isSilaTransSucceed: boolean;
  isACHQTransSucceed: boolean;
  gatewayResponse: GatewayResponse;
  isDBTransSucceed: boolean;
  status: string;
  error: Array<SilaError>;
  dbTransId: number;
  encryptedDbTransId: string;
  refNum: string;
  donaryErrorResponse: string;
  depositAvailable: string;
  isDonationRequest: boolean;
  cardLast4Digit: string;
  cardHolderName: string;
  orderId: number;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationTransactionAPIService {
  private version = 'v1/';

  private ORG_TRANSACTION_URL = `${this.version}OrganizationTrans`;

  private ORG_GET_ALL_TRANSACTION_URL = this.ORG_TRANSACTION_URL + '/Get';

  private ORG_REDEEM_TEMP_TRANSACTION_URL = this.ORG_TRANSACTION_URL + '/RedeemTemp';

  private ORG_CARD_DONATION_TRANSACTION_URL = this.ORG_TRANSACTION_URL + '/MatbiaCardDonation';

  private ORG_SCHEDULE_REDEEM_TRANSACTION_URL = this.ORG_TRANSACTION_URL + '/ScheduleRedeem';

  private ORG_BATCH_TRANSACTION_URL = this.ORG_TRANSACTION_URL + '/Batch';

  constructor(private http: HttpClient) {}

  getAll(formdata: GetOrganizationTransactionPayload): Observable<OrgTransactionResponse> {
    return this.http.post<OrgTransactionResponse>(this.ORG_GET_ALL_TRANSACTION_URL, formdata).pipe(
      map((response) => {
        // Define sort order priorities
        const sortOrderMap: Record<string, number> = {
          redeemed: 1,
          'matbia fee': 2,
          'check fee': 3,
        };

        // Process and sort transactions
        const sortedTransactions = response.transactions
          .map((transaction) => {
            return {
              ...transaction,
              transDate: moment(transaction.transDate).format('YYYY-MM-DDTHH:mm'),
              sortOrder: sortOrderMap[transaction.transType.toLowerCase()] || 4,
            };
          })
          .sort((a, b) => (a.sortOrder === 4 || b.sortOrder === 4 ? 0 : a.sortOrder - b.sortOrder));

        return {
          ...response,
          transactions: sortedTransactions,
        };
      })
    );
  }

  redeemTemp(formdata: RedeemPayload): Observable<RedeemResponse> {
    return this.http.post<RedeemResponse>(this.ORG_REDEEM_TEMP_TRANSACTION_URL, formdata).pipe((response) => {
      return response;
    });
  }

  scheduleRedeem(formdata: ScheduleRedeemPayload): Observable<RedeemResponse> {
    return this.http.post<RedeemResponse>(this.ORG_SCHEDULE_REDEEM_TRANSACTION_URL, formdata).pipe((response) => {
      return response;
    });
  }

  matbiaCardDonation(formdata: MatbiaCardDonationPayload): Observable<MatbiaCardDonationResponse> {
    return this.http
      .post<MatbiaCardDonationResponse>(this.ORG_CARD_DONATION_TRANSACTION_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  batch(formdata: BatchPayload): Observable<BatchTransactionResponse> {
    return this.http.post<BatchTransactionResponse>(this.ORG_BATCH_TRANSACTION_URL, formdata).pipe((response) => {
      return response;
    });
  }
}
