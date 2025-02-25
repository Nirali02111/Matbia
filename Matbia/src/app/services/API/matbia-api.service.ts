import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MatbiaSchedulePayload {
  orgUserHandle: string;
  orgTaxId: string;
  orgName: string;
  orgEmail: string;
  cardNum: string;
  exp: string;
  amountPerPayment: number;
  scheduleStartDate: string;
  count: number | null;
  frequency: number;
  note: string;
}

export interface MatbiaChargePayload {
  orgUserHandle: string;
  orgTaxId: string;
  orgName: string;
  orgEmail: string;
  orgPhoneNumber: string;
  orgStreet: string;
  orgCity: string;
  orgState: string;
  orgZip: string;
  cardNum: string;
  exp: string;
  amount: number;
  transDate: string;
  note: string;
  externalTransactionId: string | null;
  externalCharityID: string | null;
  feeAmount: string | null;
  tipAmount: string | null;
}

export interface MatbiaChargeResponse {
  error: string;
  status: string;
  referenceId: string;
  cardHolderName: string;
}

@Injectable({
  providedIn: 'root',
})
export class MatbiaAPIService {
  private version = 'v1/';

  private MATBIA_ROUTE_URL = `${this.version}Matbia`;
  private CHARGE_URL = this.MATBIA_ROUTE_URL + '/Charge';
  private SCHEDULE_URL = this.MATBIA_ROUTE_URL + '/Schedule';

  constructor(private http: HttpClient) {}

  charge(formData: MatbiaChargePayload): Observable<MatbiaChargeResponse> {
    return this.http.post<MatbiaChargeResponse>(this.CHARGE_URL, formData).pipe((response) => {
      return response;
    });
  }

  schedule(formData: MatbiaSchedulePayload): Observable<MatbiaChargeResponse> {
    return this.http.post<MatbiaChargeResponse>(this.SCHEDULE_URL, formData).pipe((response) => {
      return response;
    });
  }
}
