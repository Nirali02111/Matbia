import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DonorScheduleResponse, OrgScheduleResponse } from 'src/app/models/panels';

export interface DateFilter {
  fromDate: string | null;
  toDate: string | null;
}

export interface ScheduleCardObj {
  scheduleId: number;
  scheduleNum: string;
  totalAmount: number;
  totalPaid: number;
  statusId: number;
  scheduleStatus: string;
  repeatTimes: number;
  remaining: number;
  nextScheduleDateTime: string;
  frequency: string;
  frequencyId: number;
  entityId: number;
  fullName: string;
  createdDate: string;
  collectorName: string;
  transactionId: number;
  transType: string;
  amount: number;
  totalCanceled: number;
  totalFailed: number;
  openAmount: number;
  org: string | null;
  retriesCount: string;
  error: string;
  isScheduleAdmin: boolean;
  createdBy: string | null;
  method: string;
  orgLogo: string | null;
  note: string | null;
  refNum: string | null;
}

export interface PastAndUpcomingScheduleObj {
  scheduleId: number;
  scheduleNum: string;
  scheduleDateTime: string;
  transId: number;
  scheduleAmount: number;
  paidAmount: number;
  scheduleStatus: string;
  transStatus: string;
  retries: string;
  error: string;
}

export interface ScheduleCardResponse {
  mainSchedule: ScheduleCardObj;
  pastSchedules: Array<PastAndUpcomingScheduleObj>;
  upcomingSchedules: Array<PastAndUpcomingScheduleObj>;
}

export interface ScheduleCancelPayload {
  scheduleId: number;
  isStopStatus?: boolean;
  sendCancellationEmail?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleAPIService {
  private version = 'v1/';

  private SCHEDULE_URL = `${this.version}Schedule`;
  private GET_SCHEDULE_CARD_URL = this.SCHEDULE_URL + '/Card';
  private GET_SCHEDULE_CANCEL_URL = this.SCHEDULE_URL + '/Cancel';
  private GET_DONOR_SCHEDULE_URL = this.SCHEDULE_URL + '/Donor/GetAll';
  private GET_ORG_SCHEDULE_URL = this.SCHEDULE_URL + '/Org/GetAll';

  constructor(private http: HttpClient) {}

  getScheduleCard(scheduleId: number): Observable<ScheduleCardResponse> {
    return this.http
      .get<ScheduleCardResponse>(this.GET_SCHEDULE_CARD_URL, {
        params: {
          scheduleId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  cancel(apiPayload: ScheduleCancelPayload): Observable<string> {
    return this.http.post<string>(this.GET_SCHEDULE_CANCEL_URL, apiPayload).pipe((response) => {
      return response;
    });
  }

  getDonorAll(formData: DateFilter): Observable<DonorScheduleResponse> {
    return this.http.post<DonorScheduleResponse>(this.GET_DONOR_SCHEDULE_URL, formData).pipe((response) => {
      return response;
    });
  }

  getOrgAll(formData: DateFilter): Observable<OrgScheduleResponse> {
    return this.http.post<OrgScheduleResponse>(this.GET_ORG_SCHEDULE_URL, formData).pipe((response) => {
      return response;
    });
  }
}
