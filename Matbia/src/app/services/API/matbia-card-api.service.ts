import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ValidateCardResponse {
  cardId: string;
  entityId: string | null;
  status: string;
  error: string | null;
  last4DigitCardNum: string;
  email: string | null;
  isProfileComplete: boolean;
  expiry: string;
}

export interface RequestCardPayload {
  fullName: string | null;
  mailingAddress: string | null;
  apt: string | null;
  cityStateZip: string | null;
  phone: string | null;
  email: string | null;
  entityID: number | string | null;

  //
  hearAboutUs?: string | null;

  // when request for replace
  replaceCardId?: string;

  referredEntityID?: string | null;
}

export interface UpdateCardStatusPayload {
  cardId: string;
  statusId: number;
}

@Injectable({
  providedIn: 'root',
})
export class MatbiaCardAPIService {
  private version = 'v1/';

  private MATBIA_CARD_URL = `${this.version}MatbiaCard`;
  private VALIDATE_MATBIA_CARD_URL = `${this.MATBIA_CARD_URL}/Validate`;

  private REQUEST_MATBIA_CARD_URL = `${this.MATBIA_CARD_URL}/Request`;

  private MATBIA_CARD_UPDATE_STATUS_URL = `${this.MATBIA_CARD_URL}/UpdateStatus`;

  constructor(private http: HttpClient) {}

  validateCard(matbiaCardNum: string, emailValue: string = '', referredBy = ''): Observable<ValidateCardResponse> {
    let bodyParams: any = {
      matbiaCardNum,
    };

    if (emailValue) {
      bodyParams = {
        ...bodyParams,
        email: emailValue,
      };
    }

    if (referredBy) {
      bodyParams = {
        ...bodyParams,
        referredEntityID: referredBy,
      };
    }

    return this.http
      .post<ValidateCardResponse>(this.VALIDATE_MATBIA_CARD_URL, {
        ...bodyParams,
      })
      .pipe((response) => {
        return response;
      });
  }

  requestCard(data: RequestCardPayload): Observable<string> {
    return this.http.post<string>(this.REQUEST_MATBIA_CARD_URL, data).pipe((response) => {
      return response;
    });
  }

  updateCardStatus(data: UpdateCardStatusPayload): Observable<string> {
    return this.http.post<string>(this.MATBIA_CARD_UPDATE_STATUS_URL, data).pipe((response) => {
      return response;
    });
  }
}
