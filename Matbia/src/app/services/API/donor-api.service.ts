import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SilaError } from '../../models/login-model';
import { map } from 'rxjs/operators';

export interface DonorRegisterPayload {
  firstName: string;
  lastName: string;
  address: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  pin: string;
  entityId: string;

  birthDate?: string;
  ssn?: string;

  // only Requred when create user from business
  businessHandle?: string;
}

export interface DonorRegisterResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  data: {
    message: string;
    status: string;
    success: boolean;
    reference: string;
  };
  requestKYCResponse: {
    message: string;
    status: string;
    success: boolean;
    reference: string;
    verificationUuid: string;
  };
  failedKYCCount: number;
  entityId: number;
  userHandle: string;
}

export interface DonorGetResponse {
  donorId: number;
  firstName: string;
  lastName: string;
  apt: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  cellPhone: string;
  accountType: string;
  kycStatus: string;
  homePhoneId: number;
  entityEmailId: number;
  cellPhoneId: number;
  userHandle: string;

  ssn: string;
  birthDate: string;

  replenishAmount: number | null;
  triggerAmount: number | null;

  businessName: string | null;
  taxId: string | null;
  orgLogo: string | null;
}

export interface DonorUpdatePayload {
  userHandle: string;
  firstName: string;
  lastName: string;
  apt: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  cellPhone: string;
  cardId: string;
  updatedBy: number;
  birthDate: string;
  ssn: string;
  entityId: string;

  // only Requred when create user from business
  businessHandle?: string;

  orgLogo: {
    fileName: string;
    fileBase64: string;
  };
}

export interface getDeclineReplenishResponse {
  replenishAmount: number;
  maxAmount: number;
  isActive: boolean;
  bankAccountId: string;
  fundingDisabled: boolean;
}

export interface DeclineReplenishPayload {
  userHandle: string;
  replenishAmount: number;
  maxAmount: number;
  isActive?: boolean;
  bankAccountId: string;
  createdBy: number;
}
export interface DonorRequestKYC {
  data: {
    verificationUuid: string;
    reference: string;
    message: string;
    status: string;
    success: boolean;
  };
  errors: Array<SilaError>;
  success: boolean;
}

export interface AutoReplenishPayload {
  userHandle: string;
  triggerAmount: number;
  replenishAmount: number;
  isActive?: boolean;
  createdBy: number;
}

export interface DonorBalanceResponse {
  availableBalanceInclFunding: number | null;
  availableBalance: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class DonorAPIService {
  private version = 'v1/';

  private DONOR_URL = `${this.version}Donor`;
  private REGISTER_URL = this.DONOR_URL + '/Register';
  private GET_DDONOR_URL = this.DONOR_URL + '/Get';
  private UPDATE_DONOR_URL = this.DONOR_URL + '/Update';

  private DONOR_REQUESTKYC_URL = this.DONOR_URL + '/RequestKYC';

  private DONOR_SAVE_AUTO_REPLENISH_URL = this.DONOR_URL + '/SaveAutoReplenish';
  private GET_DECLINE_REPLENISH_URL = this.DONOR_URL + '/GetDeclineReplenish';
  private SAVE_DECLINE_REPLENISH_URL = this.DONOR_URL + '/SaveDeclineReplenish';

  private GET_DONOR_BALANCE_URL = this.DONOR_URL + '/GetBalance';

  constructor(private http: HttpClient) {}

  register(formdata: DonorRegisterPayload): Observable<DonorRegisterResponse> {
    return this.http.post<DonorRegisterResponse>(this.REGISTER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  get(userHandle: string): Observable<DonorGetResponse> {
    return this.http
      .get<DonorGetResponse>(this.GET_DDONOR_URL, {
        params: {
          userHandle,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getProfilePhoneList(userHandle: string): Observable<Array<{ label: string; value: string | null }>> {
    return this.get(userHandle).pipe(
      map((response) => {
        let phoneList: Array<{ label: string; value: string | null }> = [
          {
            label: 'NONE',
            value: '',
          },
        ];

        if (!response) {
          return phoneList;
        }

        if (response.phone) {
          phoneList = [...phoneList, { label: response.phone, value: response.phone }];
        }

        if (response.cellPhone) {
          phoneList = [...phoneList, { label: response.cellPhone, value: response.cellPhone }];
        }

        return phoneList;
      })
    );
  }

  update(formdata: DonorUpdatePayload): Observable<DonorRegisterResponse> {
    return this.http.put<DonorRegisterResponse>(this.UPDATE_DONOR_URL, formdata).pipe((response) => {
      return response;
    });
  }

  requestKYC(userHandle: string): Observable<DonorRequestKYC> {
    return this.http
      .post<DonorRequestKYC>(
        this.DONOR_REQUESTKYC_URL,
        {},
        {
          params: {
            userHandle,
          },
        }
      )
      .pipe((response) => {
        return response;
      });
  }

  linkMatbiaCard(formdata: { entityId: string; cardId: string }): Observable<DonorRegisterResponse> {
    return this.http.post<DonorRegisterResponse>(this.REGISTER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  saveAutoReplenish(data: AutoReplenishPayload): Observable<string> {
    return this.http.post<string>(this.DONOR_SAVE_AUTO_REPLENISH_URL, data).pipe((response) => {
      return response;
    });
  }

  getDeclineReplenish(): Observable<getDeclineReplenishResponse> {
    return this.http.get<getDeclineReplenishResponse>(this.GET_DECLINE_REPLENISH_URL).pipe((response) => {
      return response;
    });
  }

  saveDeclineReplenish(data: DeclineReplenishPayload): Observable<string> {
    return this.http.post<string>(this.SAVE_DECLINE_REPLENISH_URL, data).pipe((response) => {
      return response;
    });
  }

  getBalance(): Observable<DonorBalanceResponse> {
    return this.http.get<DonorBalanceResponse>(this.GET_DONOR_BALANCE_URL).pipe((response) => {
      return response;
    });
  }
}
