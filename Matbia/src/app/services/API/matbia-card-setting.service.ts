import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface MatbiaCardSavePayload {
  cardId: string;
  pin: string;
  corner1: string;
  corner2: string;
  corner3: string;
  corner4: string;
  createdBy: number;
  cardHolderName: string;
  phoneNum: string | null;
  statusID: number;

  IsActive?: boolean | null;
}

export interface MatbiaCardDeletePayload {
  cardId: string;
  statusID: number;
}

export interface MatbiaCardObj {
  nfc: string;
  cardNum: string;
  cardHolderName: string;
  cardId: string;
  corner1: string;
  corner2: string;
  corner3: string;
  corner4: string;
  pin: string | null;
  expiry: string;
  isActive: boolean;
  phoneNum: string | null;
  status: string | null;
  statusID: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class MatbiaCardSettingService {
  version = 'v1/';

  private SETTING_URL = `${this.version}MatbiaCardSetting`;
  private SAVE_SETTING_URL = this.SETTING_URL + '/Save';
  private GET_SETTING_URL = this.SETTING_URL + '/Get';
  #New_Card_URL = this.version + 'CardSettings/GetNewCard';

  constructor(private http: HttpClient) {}

  SaveSetting(formdata: MatbiaCardSavePayload): Observable<any> {
    return this.http.post<any>(this.SAVE_SETTING_URL, formdata).pipe((response) => {
      return response;
    });
  }

  GetSetting(userHandle: string, cardId?: string): Observable<Array<MatbiaCardObj>> {
    let params = new HttpParams();
    params = params.set('userHandle', userHandle);
    if (cardId) {
      params = params.set('cardId', cardId);
    }
    return this.http
      .post<Array<MatbiaCardObj>>(
        this.GET_SETTING_URL,
        {},
        {
          // tslint:disable-next-line: object-literal-shorthand
          params: params,
        }
      )
      .pipe((response) => {
        return response;
      });
  }

  deleteSetting(formdata: MatbiaCardDeletePayload): Observable<any> {
    return this.http.post<any>(this.SAVE_SETTING_URL, formdata).pipe((response) => {
      return response;
    });
  }

  getNewCard(userHandle: string) {
    let params = new HttpParams().set('userHandle', userHandle);
    return this.http.post(this.#New_Card_URL, {}, { params });
  }
}
