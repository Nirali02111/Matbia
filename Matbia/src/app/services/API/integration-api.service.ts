import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface IntegrateAPIPayload {
  accountNum?: number | string;
  midNum?: number | string;
}

export interface IntegrateMerchantObj {
  merchantId: number;
  name: string;
  merchantIcon: string;
  midNum: string;
}

export interface ValidateAccountNumberObj {
  merchantId: number;
}

@Injectable({
  providedIn: 'root',
})
export class IntegrationAPIService {
  private version = 'v1/';
  private INTEGRATIONS_ROUTE = 'Integrations';

  private GET_INTEGRATE_URL = `${this.version}${this.INTEGRATIONS_ROUTE}/Integrate`;

  private GET_VALIDATE_ACCOUNT_NUMBER_URL = `${this.version}${this.INTEGRATIONS_ROUTE}/ValidateAccountNumber`;
  private GET_INTEGRATED_MERCHANTS_URL = `${this.version}${this.INTEGRATIONS_ROUTE}/GetIntegratedMerchants`;

  constructor(private http: HttpClient) {}

  integrate(apiData: IntegrateAPIPayload): Observable<string> {
    return this.http.post<string>(this.GET_INTEGRATE_URL, apiData).pipe((response) => {
      return response;
    });
  }

  getIntegratedMerchants(userHandle: string): Observable<Array<IntegrateMerchantObj>> {
    return this.http
      .get<Array<IntegrateMerchantObj>>(this.GET_INTEGRATED_MERCHANTS_URL, {
        params: {
          userHandle,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getValidateAccountNumber(AccountNum: string): Observable<ValidateAccountNumberObj> {
    return this.http
      .get<ValidateAccountNumberObj>(this.GET_VALIDATE_ACCOUNT_NUMBER_URL, {
        params: {
          AccountNum,
        },
      })
      .pipe((response) => {
        return response;
      });
  }
}
