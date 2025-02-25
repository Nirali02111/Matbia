import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LinkTokenResponse, LinkAccountReq, LinkAccountResponse } from '../../models/plaid-model';

export interface LinkTokenPayload {
  userHandle: string;
  accessToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlaidApiService {
  version = 'v1/';

  PLAID_URL = `${this.version}Plaid`;
  LINK_TOKEN_URL = `${this.PLAID_URL}/LinkToken`;
  LINK_ACCOUNT_URL = `${this.PLAID_URL}/LinkAccount`;

  constructor(private http: HttpClient) {}

  getLinkToken(data: LinkTokenPayload): Observable<LinkTokenResponse> {
    return this.http.post<LinkTokenResponse>(this.LINK_TOKEN_URL, { ...data }).pipe((response) => {
      return response;
    });
  }

  linkAccount(data: LinkAccountReq): Observable<LinkAccountResponse> {
    return this.http.post<LinkAccountResponse>(this.LINK_ACCOUNT_URL, data).pipe((response) => {
      return response;
    });
  }
}
