import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SilaError } from '../../models/login-model';
import { BankAccountLinkStatus } from '@enum/BankAccount';

interface AccountCommonParams {
  accountName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface AccountObj extends AccountCommonParams {
  accountType: string;
  accountStatus: string;
  accountLinkStatus: string;
  active: boolean;

  accountOwnerName: string;
  entityName: string;
  matchScore: number;
}

export interface BankAccount extends AccountCommonParams {
  entityId: number;
  bankAccountId: string;

  accountNickName: string | null;
  accountOwnerName: string | null;
  accountStatus: string | null;
  accountType: string;

  accountLinked: string | null;
  accountLinkedTypeId: number;
  accountLinkStatus: string | null;

  isDefault: boolean;
  disabled?: boolean;
  bankName: string;
  createdDate: string;
  linkError: string;

  linkToken: string | null;

  accessToken: string | null;
  processorToken: string | null;
  fundingStatus: string;
}

export interface DeleteBankAccount {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  reference: string;
  accountName: string;
}

export interface VerifyAccountPayload {
  routingNum: string;
  accountNum: string;
  accountType: string;
  entityHandle: string;
  checkType: string;
}

export interface VerifyAccountResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
}

export interface UpdateBankAccountPayload {
  bankAccountId: string;
  accountNickname: string;
  updateBy: 0;
}

@Injectable({
  providedIn: 'root',
})
export class AccountAPIService {
  version = 'v1/';

  private ACCOUNT_URL = `${this.version}Account`;
  private GET_BANK_ACCOUNTS_URL = `${this.ACCOUNT_URL}/BankAccounts`;
  private SET_DEFAULT_ACCOUNT_URL = `${this.ACCOUNT_URL}/SetDefaultAccount`;
  private DELETE_BANK_ACCOUNTS_URL = `${this.ACCOUNT_URL}/DeleteBankAccount`;
  private SAVE_AND_VERIFY_BANK_URL = `${this.ACCOUNT_URL}/SaveAndVerifyBank`;

  private UPDATE_BANK_ACCOUNT_URL = `${this.ACCOUNT_URL}/Update`;

  constructor(private http: HttpClient) {}

  getBankAccounts(userHandle: string): Observable<{ data: Array<BankAccount>; firstAccount: BankAccount | null }> {
    return this.http
      .post<Array<BankAccount>>(
        this.GET_BANK_ACCOUNTS_URL,
        {},
        {
          params: {
            userHandle,
          },
        }
      )
      .pipe(
        map((response) => {
          return response.map((o) => {
            return {
              ...o,
              disabled:
                o.accountLinkStatus === BankAccountLinkStatus.PENDING_MANUAL_VERIFICATION ||
                o.accountLinkStatus === BankAccountLinkStatus.POSTED
                  ? true
                  : false,
            };
          });
        }),
        map((response) => {
          if (response.length === 0) {
            return {
              data: [],
              firstAccount: null,
            };
          }

          if (response.length === 1) {
            const primaryAccount = response[0];
            if (
              primaryAccount.accountLinkStatus &&
              primaryAccount.accountLinkStatus !== BankAccountLinkStatus.PENDING_MANUAL_VERIFICATION &&
              primaryAccount.accountLinkStatus !== BankAccountLinkStatus.POSTED
            ) {
              return {
                data: response,
                firstAccount: primaryAccount,
              };
            }

            return {
              data: response,
              firstAccount: null,
            };
          }

          const findDefaultAccount = response.find((o) => !!o.isDefault);
          if (findDefaultAccount) {
            return {
              data: response,
              firstAccount: findDefaultAccount,
            };
          } else {
            return {
              data: response,
              firstAccount: response[0],
            };
          }
        })
      );
  }

  setDefaultBankAccount(bankAccountId: string, deletedBy: number | string): Observable<string> {
    return this.http
      .put<string>(
        this.SET_DEFAULT_ACCOUNT_URL,
        {},
        {
          params: {
            bankAccountId,
            deletedBy,
          },
        }
      )
      .pipe((response) => {
        return response;
      });
  }

  deleteBankAccount(
    bankAccountId: string,
    deletedBy: number | string,
    newBankAccountId: number | string = ''
  ): Observable<DeleteBankAccount> {
    return this.http
      .delete<DeleteBankAccount>(this.DELETE_BANK_ACCOUNTS_URL, {
        params: {
          bankAccountId,
          deletedBy,
          newBankAccountId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  saveAndVerifyAccount(data: VerifyAccountPayload): Observable<VerifyAccountResponse> {
    return this.http.post<VerifyAccountResponse>(this.SAVE_AND_VERIFY_BANK_URL, data).pipe((response) => {
      return response;
    });
  }

  update(apiPayload: UpdateBankAccountPayload): Observable<string> {
    return this.http.post<string>(this.UPDATE_BANK_ACCOUNT_URL, apiPayload).pipe((response) => {
      return response;
    });
  }
}
