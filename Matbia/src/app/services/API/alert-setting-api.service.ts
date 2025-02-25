import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailEntityObj, PhoneEntityObj } from 'src/app/models/plaid-model';
import { map } from 'rxjs/operators';

export interface AlertSettingObj {
  alertType: string;
  entityAlertSettingId: number;
  entityId: number;
  cardId: string;
  cardNum: string;
  entityEmailId: number;
  email: string;
  entityPhoneId: number;
  phone: string;
  isPaused: boolean;
  isSendEmail: boolean;
  isSendSMS: boolean;
  manualEntryCharge: boolean;
  minAccountBalance: number;
  transMaxLimit: number;
  fromDate: string | null;
  toDate: string | null;
}

export interface SaveAlertSettingPayload {
  transAlert: {
    encryptedCardId: string;
    isPaused: boolean;
    maxLimit: number;
    isSendEmail: boolean;
    entityEmailId: number;
    isSendSMS: boolean;
    entityPhoneId: number;
  };
  balanceAlert: {
    encryptedCardId: string;
    isPaused: boolean;
    minAccountBalance: number;
    isSendEmail: boolean;
    entityEmailId: number;
    isSendSMS: boolean;
    entityPhoneId: number;
  };
  manualAlert: {
    encryptedCardId: string;
    isPaused: boolean;
    isManualEntryCharge: boolean;
    fromDate: string;
    toDate: string;
    isSendEmail: boolean;
    entityEmailId: number;
    isSendSMS: boolean;
    entityPhoneId: number;
  };
}

export interface GetAlertSettingListResponse {
  alertSettings: Array<AlertSettingObj>;
  emails: Array<EmailEntityObj>;
  phones: Array<PhoneEntityObj>;
}

@Injectable({
  providedIn: 'root',
})
export class AlertSettingAPIService {
  private version = 'v1/';

  private ALERT_SETTING_URL = `${this.version}AlertSetting`;
  private GET_ALERT_SETTING_URL = this.ALERT_SETTING_URL + '/GetCardAlert';
  private SAVE_ALERT_SETTING_URL = this.ALERT_SETTING_URL + '/Save';

  constructor(private http: HttpClient) {}

  get(cardId: string): Observable<GetAlertSettingListResponse> {
    return this.http.get<GetAlertSettingListResponse>(this.GET_ALERT_SETTING_URL, { params: { cardId } }).pipe(
      map((res) => {
        if (!res.emails || res.emails.length === 0) {
          return {
            ...res,
            emails: [],
          };
        }

        const haveDefault = res.emails.find((o) => {
          return o.isDefault === true;
        });

        if (haveDefault) {
          return {
            ...res,
            emails: res.emails,
          };
        }

        const emailsList = res.emails.map((o, i) => {
          if (i === 0) {
            return {
              ...o,
              isDefault: true,
            };
          }

          return {
            ...o,
          };
        });

        return {
          ...res,
          emails: emailsList,
        };
      })
    );
  }

  save(data: SaveAlertSettingPayload): Observable<string> {
    return this.http.post<string>(this.SAVE_ALERT_SETTING_URL, data).pipe((response) => {
      return response;
    });
  }
}
