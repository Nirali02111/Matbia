import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonationRequestResponse, DonationRequestObj } from 'src/app/models/panels';

export interface RequestUpdatesPayload {
  donationRequestId: number;
  status: string;
  snoozeDate: string;
  donationRequestIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class DonationRequestAPIService {
  private version = 'v1/';

  private DONATION_REQUEST_URL = `${this.version}DonationRequest`;
  private ORGANIZATION_RRQUEST_URL = `${this.version}OrgRequest`;
  private GET_DONATION_REQUEST_URL = this.DONATION_REQUEST_URL + '/Get';
  private GET_ALL_DONATION_REQUEST_URL = this.DONATION_REQUEST_URL + '/GetAll';
  private GET_ORG_DONATION_REQUEST_URL = this.ORGANIZATION_RRQUEST_URL + '/GetAll';
  private GET_UPDATE_DONATION_REQUEST_URL = this.DONATION_REQUEST_URL + '/UpdateStatus';

  constructor(private http: HttpClient) {}

  getRequest(donationReqId: number): Observable<DonationRequestObj> {
    return this.http
      .post<DonationRequestObj>(
        this.GET_DONATION_REQUEST_URL,
        {},
        {
          params: {
            donationReqId,
          },
        }
      )
      .pipe((response) => {
        return response;
      });
  }

  getAllRequest(formData: { fromDate: string; toDate: string }): Observable<DonationRequestResponse> {
    return this.http.post<DonationRequestResponse>(this.GET_ALL_DONATION_REQUEST_URL, formData).pipe((response) => {
      return response;
    });
  }

  getAllOrgRequest(formData: { fromDate: string; toDate: string }) {
    return this.http.post<any>(this.GET_ORG_DONATION_REQUEST_URL, formData).pipe((response) => {
      return response;
    });
  }

  updateStatus(formData: RequestUpdatesPayload): Observable<string> {
    return this.http.put<string>(this.GET_UPDATE_DONATION_REQUEST_URL, formData).pipe((response) => {
      return response;
    });
  }
}
