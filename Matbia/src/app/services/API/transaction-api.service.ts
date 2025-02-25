import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  GetTransactionResponse,
  IssueSilaRequest,
  IssueSilaResponse,
  RedeemSilaRequest,
  RedeemSilaResponse,
  TransaferSilaRequest,
  TransferSilaResponse,
} from './../../models/transaction-api.model';

export interface CancelDepositPayload {
  userHandle: string;
  dbTransId: string;
}

export interface CancelRedeemPayload {
  userHandle: string;
  dbTransId: string;
  silaTransId?: string;
}

export interface CancelDepositResponse {
  error_code: null;
  message: string;
  reference: string;
  response_time_ms: string;
  status: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionAPIService {
  version = 'v1/';

  private TRANSACTION_URL = `${this.version}Trans`;

  private GET_TRANSACTION_URL = `${this.TRANSACTION_URL}/GetTrans`;
  private ISSUE_SILA_URL = `${this.TRANSACTION_URL}/IssueSila`;
  private REDEEM_SILA_URL = `${this.TRANSACTION_URL}/RedeemSila`;
  private TRANSFER_SILA_URL = `${this.TRANSACTION_URL}/TransferSila`;
  private CANCEL_DEPOSIT_URL = `${this.TRANSACTION_URL}/CancelDeposit`;
  private CANCEL_REDEEM_URL = `${this.TRANSACTION_URL}/CancelRedeem`;
  private TRANSFER_AFWALLET_URL = `${this.TRANSACTION_URL}/TransferAFWalletAmountToMatbiaWallet`;
  private CONVERT_SILA_LINKED_ACCOUNT_URL = `${this.TRANSACTION_URL}/ConvertSilaLinkedAccountToACHQ`;

  constructor(private http: HttpClient) {}

  getTransactionList(userHandle: string): Observable<GetTransactionResponse> {
    return this.http.post<GetTransactionResponse>(this.GET_TRANSACTION_URL, { userHandle }).pipe((response) => {
      return response;
    });
  }

  IssueSila(data: IssueSilaRequest): Observable<IssueSilaResponse> {
    return this.http.post<IssueSilaResponse>(this.ISSUE_SILA_URL, data).pipe((response) => {
      return response;
    });
  }

  RedeemSila(data: RedeemSilaRequest): Observable<RedeemSilaResponse> {
    return this.http.post<RedeemSilaResponse>(this.REDEEM_SILA_URL, data).pipe((response) => {
      return response;
    });
  }

  TransferSila(data: TransaferSilaRequest): Observable<TransferSilaResponse> {
    return this.http.post<TransferSilaResponse>(this.TRANSFER_SILA_URL, data).pipe((response) => {
      return response;
    });
  }

  CancelDeposit(data: CancelDepositPayload): Observable<CancelDepositResponse> {
    return this.http.post<CancelDepositResponse>(this.CANCEL_DEPOSIT_URL, data).pipe((response) => {
      return response;
    });
  }

  CancelRedeem(data: CancelRedeemPayload): Observable<CancelDepositResponse> {
    return this.http.post<CancelDepositResponse>(this.CANCEL_REDEEM_URL, data).pipe((response) => {
      return response;
    });
  }

  transferAFWallet(entityHandle: string): Observable<string> {
    return this.http
      .get<string>(this.TRANSFER_AFWALLET_URL, {
        params: {
          entityHandle,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  convertSilaAccountToACH(bankAccountId: string): Observable<string> {
    return this.http
      .get<string>(this.CONVERT_SILA_LINKED_ACCOUNT_URL, {
        params: {
          bankAccountId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }
}
