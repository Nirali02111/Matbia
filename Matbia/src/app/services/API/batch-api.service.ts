import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BatchDetailObj {
  batchNum: number;
  totalAmount: number;
  createdDate: string;
  type: string;
  toBank: string;
  batchedBy: string;
  donationCount: number;
  donationAmount: number;
  totalMatbiaFee: number;
  firstTransDate: string;
  lastTransDate: string;
  transStatus: string | null;
}

export interface GetBatchDetailsPayload {
  batchNum?: number | null;
  fromDate: string | null;
  toDate: string | null;
}

export interface GetBatchDetailsResponse {
  availableBalance: number;
  pastDonations: number;
  presentBalance: number;
  totalDonations: number;
  batchDetailList: Array<BatchDetailObj>;
}

@Injectable({
  providedIn: 'root',
})
export class BatchAPIService {
  private version = 'v1/';

  private BATCH_URL = `${this.version}Batch`;

  private GET_BATCH_DETAILS_URL = this.BATCH_URL + '/GetBatchDetails';

  constructor(private http: HttpClient) {}

  getBatchDetails(apiData: GetBatchDetailsPayload): Observable<GetBatchDetailsResponse> {
    return this.http.post<GetBatchDetailsResponse>(this.GET_BATCH_DETAILS_URL, apiData).pipe((response) => {
      return response;
    });
  }
}
