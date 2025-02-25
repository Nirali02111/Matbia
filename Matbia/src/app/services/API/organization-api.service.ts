import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BusinessUpdatePayload, BusinessUpdateResponse } from 'src/app/models/login-model';

export interface OrgObj {
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
  orgJewishName: string | null;
  orgLogo: string | null;
  taxId: string | null;
  address: string | null;
  encryptedOrgId: string;

  apt: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  employerId: string | null;
  email: string | null;
  phone: string | null;
  officePhone: string | null;
  isFavourite: boolean | null;
  isPasswordSet: boolean;
  suggestedOrgId: number;

  orgEncryptedOrgId: string | null;
  accountNumber: string | null;
  accountType: string | null;
  addressType: string | null;
  criteriaMessage: string | null;
  externalSourceName: string | null;
  organizationName: string | null;

  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  mailing: {
    apt: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  legalAddress: {
    apt: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
}

export interface FavoriteOrgObj {
  orgID: number;
  orgFavouriteId: number;
  entityID: number;
  isFavourite: true;
  orgName: string;
  orgJewishName: string | null;
  orgLogo: string | null;
  businessType: string | null;
  encryptedOrgId: string;
  doingBusinessAs: string | null;
  email: string | null;
}

export interface OrgValidatePayload {
  entityId: string;
  taxId: string;
  email: string;
}

export interface OrgValidateResponse {
  isValid: boolean;
  message: string;
}

export interface OrgBalanceResponse {
  availableBalance: number;
  fee: number | null;

  autoRedeemAmount: number | null;
  recurrenceId: number | null;
  scheduleDateTime: string | null;
  hasRedeem: boolean;
  feePercentage: number | null;
  scheduleId: number | null;
  availTransCount: number | null;
  openSchedules: number | null;
}

export interface OrgTransactionFeeResponse {
  availableBalance: number | null;
  fee: number | null;
  feePercentage: number | null;
}

export interface OrgExternalFeeResponse {
  fee: number | null;
}

export interface SaveFavoriteOrganizationPayload {
  userHandle: string;
  orgID: number;
  isFavourite: boolean;
  createdBy: number;
}

export interface SuggestOrganizationPayload {
  orgID: number;
  orgName: string;
  taxID: string;
  contactName: string;
  contactNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface SaveOrganizationPayload {
  dba: string;
  taxId: string;
  orgLegalName: string;
  yiddishDisplayName: string;
  displayName: string;

  email: string;
  phone: string;
  cellPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  legalAddress: string;
  legalCity: string;
  legalState: string;
  legalZip: string;

  orgLogoBase64: string;
  ownerIdAttachmentBase64: string;
  orgIdAttachmentBase64: string;

  ownerName: string;
  ownerPhoneNumber: string;
  ownerPhoneExt: string;
  ownerEmail: string;
  fromEntityId: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationAPIService {
  private version = 'v1/';

  private ORGANIZATION_URL = `${this.version}Organization`;

  private GET_SAVE_ORGANIZATION_URL = `${this.ORGANIZATION_URL}/SaveOrg`;

  private GET_ORGANIZATION_URL = `${this.ORGANIZATION_URL}/Get`;
  private GET_ALL_ORGANIZATION_URL = `${this.ORGANIZATION_URL}/GetAll`;

  private GET_ALL_FAVORITE_ORGANIZATION_URL = `${this.ORGANIZATION_URL}/GetFavouriteOrgs`;

  private GET_ORGANIZATION_NAME_URL = `${this.ORGANIZATION_URL}/GetName`;

  private VALIDATE_ORGANIZATION_URL = `${this.ORGANIZATION_URL}/Validate`;

  private GET_ORGANIZATION_BALANCE_URL = `${this.ORGANIZATION_URL}/GetBalance`;

  private GET_ORGANIZATION_TRAN_FEE_URL = `${this.ORGANIZATION_URL}/GetTransFee`;

  private GET_ORGANIZATION_EXT_FEE_URL = `${this.ORGANIZATION_URL}/GetExternalFee`;

  private GET_ORGANIZATION_UPDATE_URL = `${this.ORGANIZATION_URL}/Update`;

  private SAVE_ORGANIZATION_AUTO_REDEEM = `${this.ORGANIZATION_URL}/SaveAutoRedeem`;

  private SAVE_FAVORITE_ORGANIZATION_URL = `${this.ORGANIZATION_URL}/SaveFavOrg`;

  private ORGANIZATION_SUGGEST_INFO_URL = `${this.ORGANIZATION_URL}/SuggestInfo`;

  private GET_ALL_ORGANIZATION_URL_BYFIELDS = `${this.ORGANIZATION_URL}/Search`;

  constructor(private http: HttpClient) {}

  saveOrganization(data: SaveOrganizationPayload): Observable<string> {
    return this.http.post<string>(this.GET_SAVE_ORGANIZATION_URL, data).pipe((response) => {
      return response;
    });
  }

  getOrganizationList(userHandle: string, search: string): Observable<Array<OrgObj>> {
    return this.http
      .get<Array<OrgObj>>(this.GET_ALL_ORGANIZATION_URL, {
        params: {
          userHandle,
          search,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getOrganizationListByFields(
    userHandle: string,
    searchString: string,
    searchTypeClause: string
  ): Observable<Array<OrgObj>> {
    return this.http
      .get<Array<OrgObj>>(this.GET_ALL_ORGANIZATION_URL_BYFIELDS, {
        params: {
          userHandle,
          searchString,
          searchTypeClause,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  private getOrg(params: {}) {
    return this.http
      .get<OrgObj>(this.GET_ORGANIZATION_URL, {
        params: {
          ...params,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getOrganizationById(orgId: string): Observable<OrgObj> {
    return this.getOrg({ orgId });
  }

  getOrganizationByUsername(orgHandle: string): Observable<OrgObj> {
    return this.getOrg({ orgHandle: JSON.stringify(orgHandle) });
  }

  getNameEncryptedId(encryptedOrgId: string): Observable<{ name: string }> {
    return this.http
      .get<{ name: string }>(this.GET_ORGANIZATION_NAME_URL, {
        params: {
          encryptedOrgId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getFavoriteOrganizationList(userHandle: string): Observable<Array<FavoriteOrgObj>> {
    return this.http
      .get<Array<FavoriteOrgObj>>(this.GET_ALL_FAVORITE_ORGANIZATION_URL, {
        params: {
          entityHandle: userHandle,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  validateOrganization(data: OrgValidatePayload): Observable<OrgValidateResponse> {
    return this.http.post<OrgValidateResponse>(this.VALIDATE_ORGANIZATION_URL, data).pipe((response) => {
      return response;
    });
  }

  update(data: BusinessUpdatePayload): Observable<BusinessUpdateResponse> {
    return this.http.put<BusinessUpdateResponse>(this.GET_ORGANIZATION_UPDATE_URL, data).pipe((response) => {
      return response;
    });
  }

  getBalance(): Observable<OrgBalanceResponse> {
    return this.http.get<OrgBalanceResponse>(this.GET_ORGANIZATION_BALANCE_URL).pipe((response) => {
      return response;
    });
  }

  getTransactionFee(transAmount: number): Observable<OrgTransactionFeeResponse> {
    return this.http
      .get<OrgTransactionFeeResponse>(this.GET_ORGANIZATION_TRAN_FEE_URL, {
        params: {
          transAmount,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getExternalFee(): Observable<OrgExternalFeeResponse> {
    return this.http.get<OrgExternalFeeResponse>(this.GET_ORGANIZATION_EXT_FEE_URL).pipe((response) => {
      return response;
    });
  }

  saveOrganizationAutoRedeem(data: { triggerAmount: number; isStopRequest?: boolean }): Observable<string> {
    return this.http.post<string>(this.SAVE_ORGANIZATION_AUTO_REDEEM, data).pipe((response) => {
      return response;
    });
  }

  saveFavoriteOrganization(data: SaveFavoriteOrganizationPayload): Observable<string> {
    return this.http.post<string>(this.SAVE_FAVORITE_ORGANIZATION_URL, data).pipe((response) => {
      return response;
    });
  }

  suggestOrganization(data: SuggestOrganizationPayload): Observable<string> {
    return this.http.post<string>(this.ORGANIZATION_SUGGEST_INFO_URL, data).pipe((response) => {
      return response;
    });
  }
}
