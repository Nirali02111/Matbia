import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LinkMemberResponse } from '../../models/common-api-model';
import { SilaError } from 'src/app/models/login-model';

export interface LinkMembersPayload {
  admins: Array<string>;
  controllingOfficers: Array<string>;
  benificialOwners: Array<{
    userHandle: string;
    ownershipStake: number;
  }>;
  businessHandle: string;
}

export interface LinkMembersResponse {
  admins: Array<LinkMemberResponse>;
  officers: Array<LinkMemberResponse>;
  owners: Array<LinkMemberResponse>;
}

export interface LinkedMember {
  entityLinkMemberId: number;
  businessId: number;
  businessName: string;
  memberId: number;
  memberHandle: string;
  member: string;
  roleUuId: string;
  roleName: string;
  roleLabel: string;
  ownershipStake: 0;
}

export interface DeleteBusinessLinkMemberResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  data: {
    message: string;
    status: string;
    success: boolean;
    reference: string;
    errorCode: string;
    responseTimeMs: string;
    role: string;
    details: string;
    verificationUuid: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BusinessLinkMemberAPIService {
  version = 'v1/';

  private BUSINESS_LINK_MEMBER_URL = `${this.version}BusinessLinkMember`;
  private BULK_LINK_MEMEBER_URL = this.BUSINESS_LINK_MEMBER_URL + '/BulkLink';
  private GET_BUSINESS_LINK_MEMBER_URL = this.BUSINESS_LINK_MEMBER_URL + '/GetAll';
  private DELETE_BUSINESSLINKMEMBER_URL = this.BUSINESS_LINK_MEMBER_URL + '/Delete';

  constructor(private http: HttpClient) {}

  linkMembers(formdata: LinkMembersPayload): Observable<LinkMembersResponse> {
    return this.http.post<LinkMembersResponse>(this.BULK_LINK_MEMEBER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  getAll(businessHandle: string): Observable<Array<LinkedMember>> {
    return this.http
      .get<Array<LinkedMember>>(this.GET_BUSINESS_LINK_MEMBER_URL, { params: { businessHandle } })
      .pipe((response) => {
        return response;
      });
  }

  deleteMember(businessLinkMemberId: number): Observable<DeleteBusinessLinkMemberResponse> {
    return this.http
      .post<DeleteBusinessLinkMemberResponse>(this.DELETE_BUSINESSLINKMEMBER_URL, {
        businessLinkMemberId,
      })
      .pipe((response) => {
        return response;
      });
  }
}
