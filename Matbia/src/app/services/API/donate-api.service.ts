import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DonateOrgObj {
  encryptedOrgId: string;
  orgId: number;
  orgHandle: string;
  businessName: string;
  displayName: string;
  businessType: string;
  businessWebsite: string;
  doingBusinessAs: string;
  naicsCode: number;
  orgWalletId: number;
  orgWalletAddress: string;
  accountType: string;
  email: string;
  orgJewishName: string;
  orgLogo: string;
  taxId: string;
  address: string;
  apt: string;
  addressType: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  employerId: string;
  officePhone: string;
  isFavourite: boolean;
  isPasswordSet: boolean;
  externalSourceName: string;
  organizationName: string;
  criteriaMessage: string;
  suggestedOrgId: number;
  accountNumber: string;

  orgEncryptedOrgId: string;
}

@Injectable({
  providedIn: 'root',
})
export class DonateAPIService {
  private version = 'v1/';

  private DONATE_URL = `${this.version}Donate`;
  private GET_DONATE_ORG_URL = this.DONATE_URL + '/GetOrg';

  constructor(private http: HttpClient) {}

  get(orgId: string): Observable<DonateOrgObj> {
    return this.http
      .get<DonateOrgObj>(this.GET_DONATE_ORG_URL, {
        params: {
          orgId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }
}
