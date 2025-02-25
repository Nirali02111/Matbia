import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from '@enum/Assets';
import { DepositType } from '@enum/DepositType';
import { TokenStatus } from '@enum/Token';
import { TransactionStatus } from '@enum/Transaction';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SilaError } from 'src/app/models/login-model';
import { groupBy, min, sumBy, map as _map } from 'lodash-es';
import { DonorTransactionObj, GatewayResponse, GetDonorTransactionPayload, RecurringObj } from 'src/app/models/panels';
import _ from 'lodash';

type depositTypes = DepositType.PAYPAL | DepositType.CHECK | DepositType.DAF | DepositType.WIRE_TRANSFER;

export interface DepositPayload {
  userHandle: string;
  amount: number;
  bankAccountId: string;
  transDate: string;
  transferNowAmount?: number;
  isNotifyOnEmail?: boolean;
  isNotifyOnSMS?: boolean;
  recurringPayment?: RecurringObj;
  createdBy?: number;
  note: string | null;
}

export interface DepositResponse {
  isSilaTransSucceed: true;
  gatewayResponse: GatewayResponse;
  isDBTransSucceed: boolean;
  depositAvailable: string;
  status: string;
  error: Array<SilaError>;
  dbTransId: number;
  encryptedDbTransId: string;
}

export interface DepositExternalPayload {
  userHandle: string | null;
  createdBy: number | null;
  depositType: depositTypes;
  depositDate: string | null;
  amount?: number | null;
  externalRefNum?: string | null;
  note?: string | null;
  dafName?: string | null;
  checkDetails?: {
    checkImageFront: string | null;
    checkImageBack: string | null;
    checkdeliveryType: 'upload' | 'mail';
  };
  payerInfo?: {
    payerName: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface DonatePayload {
  donorHandle: string;
  amount: number;
  transDate: string;
  transferNowAmount?: number;
  isNotifyOnEmail?: boolean;
  isNotifyOnSMS?: boolean;
  orgId: string;
  note?: string;
  recurringPayment?: {
    count: number;
    amount: number;
    frequency: number;
    scheduleDate: string;
  };
  createdBy?: number;
}

export interface DonorTransactionResponse {
  transactions: Array<DonorTransactionObj>;
  tokens: Array<DonorTransactionObj>;
  availableBalance: number;
  deposits: number;
  donations: number;
  firstTransactionDate?: string;
}

export interface DonorVoidTransactionPayload {
  transId: string;
  requestId?: string;
}

export interface DonorVoidTransactionResponse {
  isSilaTransSucceed: boolean;
  gatewayResponse: GatewayResponse;
  isDBTransSucceed: boolean;
  status: string;
  error: Array<SilaError>;
  dbTransId: number;
  donaryErrorResponse: string;
  depositAvailable: string | null;
}

export interface DepositReceiptResponse {
  receiptUrl: string;
}

export interface UpdateDonationNotePayload {
  userHandle: string;
  transactionId: number | string;
  note: string | null;
}

export interface TokenBookObj {
  bookID: number;
  bookNumber: number;
  bookName: string | null;
}

export interface GetOrgDonationHistoryPayload {
  userHandle: string;
  fromDate: string | null;
  toDate: string | null;
  organizationId?: number;
  encryptedOrgId?: string;
  campaignName?: string | null;
}

interface TraHis {
  date: string | null;
  dateValue: number | null;
  status: string | null;
  amount: number | null;
}

export interface DonationHistoryObj {
  orgId: string | number;
  orgEncryptedOrgId: string | null;
  organizationName: string | null;
  doingBusinessAs: string | null;
  orgJewishName: string | null;
  orgLogo: string;
  taxId: string | null;
  phone: string | null;
  donationsTotal: number | null;
  donationsCount: number | null;
  averageDonation: number | null;
  firstDonationDate: string | null;
  lastDonationDate: string | null;
  transHistory: Array<TraHis> | null;
  campaignName: string | null;
  campaignId: number | null;
  isDisplay: boolean;
}

export interface DonationRequest {
  donationRequestId: number;
  donationAmount: number;
  note: string;
}

export interface Donation {
  donorHandle: string;
  transDate: string; // ISO string format for date
  createdBy: number;
  donationRequests: DonationRequest[];
}
export interface SavedepositPayload {
  userHandle: string;
  authImage: string | null;
  dbTransId: number;
}

@Injectable({
  providedIn: 'root',
})
export class DonorTransactionAPIService {
  private version = 'v1/';
  private version2 = 'v2/';

  private DONOR_TRANSACTION_URL = `${this.version}DonorTrans`;
  private DONOR_TRANSACTION_URL2 = `${this.version2}DonorTrans`;
  private DONOR_TRANSACTION_DEPOSIT_URL = this.DONOR_TRANSACTION_URL + '/Deposit';

  private DONOR_TRANSACTION_DEPOSIT_EXTERNAL_URL = this.DONOR_TRANSACTION_URL + '/DepositExternal';

  private DONOR_TRANSACTION_DONATE_URL = this.DONOR_TRANSACTION_URL + '/Donate';

  private DONOR_GET_ALL_TRANSACTION_URL = this.DONOR_TRANSACTION_URL + '/GetAll';

  private DONOR_VOID_TRANSACTION_URL = this.DONOR_TRANSACTION_URL + '/VoidPayment';

  private DONOR_REFUND_TRANSACTION_URL = this.DONOR_TRANSACTION_URL + '/RefundPayment';

  private DONOR_DEPOSIT_RECEIPT_URL = this.DONOR_TRANSACTION_URL + '/DepositReceipt';

  private GET_DONOR_BULK_DEPOSIT_RECEIPT_URL = this.DONOR_TRANSACTION_URL2 + '/BulkDepositReceipt';

  private GET_DONOR_TRANSACTION_STATEMENT_URL = this.DONOR_TRANSACTION_URL2 + '/Statement';

  private UPDATE_DONOR_TRANSACTION_NOTE_URL = this.DONOR_TRANSACTION_URL + '/UpdateNote';

  private GET_ORG_DONATION_HISTORY_URL = this.DONOR_TRANSACTION_URL + '/GetOrgDonationHistory';

  private BULK_FULLFILL_REQUESTS = this.DONOR_TRANSACTION_URL + '/BulkFulfillRequests';
  private SAVE_DEPOSIT_URL = this.DONOR_TRANSACTION_URL + '/SaveDepositAuth';

  constructor(private http: HttpClient) { }

  deposit(formData: DepositPayload): Observable<DepositResponse> {
    return this.http.post<DepositResponse>(this.DONOR_TRANSACTION_DEPOSIT_URL, formData).pipe((response) => {
      return response;
    });
  }
  savedeposit(formData: SavedepositPayload): Observable<string> {
    return this.http.post<string>(this.SAVE_DEPOSIT_URL, formData).pipe((response) => {
      return response;
    });
  }
  depositExternal(formData: DepositExternalPayload): Observable<string> {
    return this.http.post<string>(this.DONOR_TRANSACTION_DEPOSIT_EXTERNAL_URL, formData).pipe((response) => {
      return response;
    });
  }

  donate(formData: DonatePayload): Observable<DepositResponse> {
    return this.http.post<DepositResponse>(this.DONOR_TRANSACTION_DONATE_URL, formData).pipe((response) => {
      return response;
    });
  }

  getAll(formData: GetDonorTransactionPayload): Observable<DonorTransactionResponse> {
    let firstTransactionDate: string;
    return this.http.post<DonorTransactionResponse>(this.DONOR_GET_ALL_TRANSACTION_URL, formData).pipe(
      map((res) => {
        if (res.transactions && res.transactions.length !== 0) {
          const { transactions, ...restRes } = res;

          firstTransactionDate = transactions[transactions.length - 1].createdDate || '';

          const list = transactions.map((t) => {
            return {
              ...t,
              method: t.method === 'Wallet Transfer' ? 'Portal Donation' : t.method,
            };
          });

          const tokens = list.filter((i) => {
            return !!i.bookNumber;
          });

          const transactionsUpdates = list.filter((i) => {
            return !i.bookNumber;
          });

          return {
            ...restRes,
            transactions: transactionsUpdates,
            tokens: tokens.map((o) => {
              return {
                ...o,
              };
            }),
          };
        }

        return {
          ...res,
          transactions: [],
          tokens: [],
        };
      }),

      map((res: any) => {
        if (res.tokens && res.tokens.length !== 0) {
          const tokensArray = [];
          res.tokens = res?.tokens.map((token: any) => ({ ...token, _transDate: moment(token?.transDate).format('YYYY-MM-DD') }))
          const groupedValue = _.groupBy(res.tokens, (item: any) => `${item?.bookNumber}_${item?._transDate}`);

          for (const key in groupedValue) {
            if (Object.prototype.hasOwnProperty.call(groupedValue, key)) {
              const tokenBookList: Array<DonorTransactionObj> = groupedValue[key];

              const tokenBook = _map(groupBy(tokenBookList, 'transStatus'), (objs: any, key: any) => ({
                status: key,
                count: objs.length,
                amount: sumBy(objs, 'amount'),
              }));

              const tokenBalance: Array<number> = _map(tokenBookList, (o: DonorTransactionObj) => o.balance);

              const totalSum = sumBy(tokenBook, 'amount');
              const totalCount = tokenBookList.length;
              const totalBalance = min(tokenBalance);
              const remainingObj = tokenBook.find((t: any) => {
                return t.status === TransactionStatus.GENERATED;
              });

              const processObj = tokenBook.find((t: any) => {
                return t.status === TokenStatus.PROCESSED || t.status === TransactionStatus.SUCCESS;
              });

              const voidObj = tokenBook.find((t: any) => {
                return t.status === TokenStatus.VOIDED;
              });

              let tokenListIndex = tokenBookList.findIndex((t: any) => t.transStatus == 'Generated');

              if (tokenListIndex === -1) {
                tokenListIndex = tokenBookList.findIndex((t: any) => t.transStatus == 'Expired');

                if (tokenListIndex === -1) {
                  tokenListIndex = tokenBookList.findIndex((t: any) => t.transStatus == TransactionStatus.SUCCESS);

                  if (tokenListIndex === -1) {
                    tokenListIndex = tokenBookList.findIndex((t: any) => t.transStatus == TransactionStatus.PENDING);

                    if (tokenListIndex === -1) {
                      tokenListIndex = 0;
                    }
                  }
                }
              }
              if (tokenListIndex === -1) {
                tokenListIndex = tokenBookList.findIndex((t: any) => t.transStatus == TransactionStatus.SUCCESS);

                if (tokenListIndex === -1) {
                  tokenListIndex = tokenBookList.findIndex((t: any) => t.transStatus == TransactionStatus.PENDING);

                  if (tokenListIndex === -1) {
                    tokenListIndex = 0;
                  }
                }
              }

              const tokenBookDetails = {
                totalAmount: totalSum,
                totalCount: totalCount,

                processAmount: processObj ? processObj.amount : 0,
                processCount: processObj ? processObj.count : 0,

                voidedAmount: voidObj ? voidObj.amount : 0,
                voidedCount: voidObj ? voidObj.count : 0,

                remainingAmount: remainingObj ? remainingObj.amount : totalSum,
                remainingCount: remainingObj ? remainingObj.count : totalCount,

                balance: totalBalance,
                tokenBookList: tokenBookList,
              };
              tokensArray.push({
                ...tokenBookList[tokenListIndex],
                tokenBookDetails,
                amount: totalSum,
              });
            }
          }

          return {
            ...res,
            transactions: res.transactions.concat(tokensArray),
            tokens: res.tokens,
            firstTransactionDate,
          };
        }

        return {
          ...res,
          tokens: [],
          firstTransactionDate,
        };
      })
    );
  }

  voidTransaction(formData: DonorVoidTransactionPayload): Observable<DonorVoidTransactionResponse> {
    return this.http.post<DonorVoidTransactionResponse>(this.DONOR_VOID_TRANSACTION_URL, formData).pipe((response) => {
      return response;
    });
  }

  refundTransaction(transId: string): Observable<DonorVoidTransactionResponse> {
    return this.http
      .post<DonorVoidTransactionResponse>(this.DONOR_REFUND_TRANSACTION_URL, { transId })
      .pipe((response) => {
        return response;
      });
  }

  depositReceipt(transId: string) {
    return this.http
      .get<DepositReceiptResponse>(this.DONOR_DEPOSIT_RECEIPT_URL, {
        params: {
          transId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  private getParams(userHandle: string, fromDate: Date | null = null, toDate: Date | null = null) {
    let params: any = {
      userHandle,
    };

    if (fromDate) {
      params = {
        ...params,
        fromDate: fromDate,
      };
    }

    if (toDate) {
      params = {
        ...params,
        toDate: toDate,
      };
    }

    return {
      ...params,
    };
  }

  getBulkDepositReceipt(userHandle: string, fromDate: Date | null = null, toDate: Date | null = null) {
    const params = this.getParams(userHandle, fromDate, toDate);

    return this.http
      .get<string>(this.GET_DONOR_BULK_DEPOSIT_RECEIPT_URL, {
        params: {
          ...params,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getStatement(userHandle: string, fromDate: Date | null = null, toDate: Date | null = null) {
    const params = this.getParams(userHandle, fromDate, toDate);

    return this.http
      .get<string>(this.GET_DONOR_TRANSACTION_STATEMENT_URL, {
        params: {
          ...params,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  updateNote(formData: UpdateDonationNotePayload): Observable<string> {
    return this.http.post<string>(this.UPDATE_DONOR_TRANSACTION_NOTE_URL, formData).pipe((response) => {
      return response;
    });
  }

  getTokenBook(params: {
    bookNumber?: number | string | null;
    entityId?: number | string | null;
  }): Observable<Array<TokenBookObj>> {
    let qParam = {};

    if (params.bookNumber) {
      qParam = {
        bookNumber: params.bookNumber,
      };
    }

    if (params.entityId) {
      qParam = {
        entityId: params.entityId,
      };
    }

    return this.http
      .get<Array<TokenBookObj>>('v1/DonorTokens/GetBooks', {
        params: {
          ...qParam,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getOrgDonationHistory(apiData: GetOrgDonationHistoryPayload): Observable<DonationHistoryObj> {
    return this.http.post<DonationHistoryObj>(this.GET_ORG_DONATION_HISTORY_URL, apiData).pipe(
      map((res) => {
        return {
          ...res,
          orgLogo: !res.orgLogo ? Assets.PROFILE_IMAGE : res.orgLogo,
        };
      }),
      map((res) => {
        const { transHistory } = res;

        const newV = (transHistory || [])
          .map((o) => {
            return {
              ...o,
              dateValue: o.date ? new Date(o.date).getTime() : null,
            };
          })
          .sort((a, b) => {
            if (!a.dateValue || !b.dateValue) {
              return -1;
            }

            return a.dateValue < b.dateValue ? 1 : -1;
          });

        return {
          ...res,
          transHistory: newV,
        };
      })
    );
  }

  bulkFullfillRequests(requests: Donation) {
    return this.http.post(this.BULK_FULLFILL_REQUESTS, requests);
  }
}
