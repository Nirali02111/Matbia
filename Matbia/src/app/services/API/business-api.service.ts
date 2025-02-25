import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BusinessRegister,
  RegisterResponse,
  BusinessUpdatePayload,
  BusinessUpdateResponse,
} from '../../models/login-model';
import {
  LinkMemberData,
  LinkMemberResponse,
  KYBResponse,
  CertifyBeneficialOwnerRequest,
  CertifyBeneficialOwnerResponse,
  CertifyBusinessRequest,
  CertifyBusinessResponse,
  BusinessGetEntitiyResponse,
} from '../../models/common-api-model';

@Injectable()
export class BusinessAPIService {
  version = 'v1/';

  BUSINESS_URL = `${this.version}Business`;
  REGISTER_URL = this.BUSINESS_URL + '/Register';
  UPDATE_URL = this.BUSINESS_URL + '/Update';
  LINK_MEMEBER_URL = this.BUSINESS_URL + '/LinkMember';
  UNLINK_MEMEBER_URL = this.BUSINESS_URL + '/UnLinkMember';
  REQUEST_KYB_URL = this.BUSINESS_URL + '/RequestKYB';
  GET_ENTITY_URL = this.BUSINESS_URL + '/GetEntity';

  CERTIFY_BENEFICIAL_OWNER_URL = this.BUSINESS_URL + '/CertifyBeneficialOwner';
  CERTIFY_BUSINESS_URL = this.BUSINESS_URL + '/CertifyBusiness';

  constructor(private http: HttpClient) {}

  register(formdata: BusinessRegister): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.REGISTER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  update(formdata: BusinessUpdatePayload): Observable<BusinessUpdateResponse> {
    return this.http.put<BusinessUpdateResponse>(this.UPDATE_URL, formdata).pipe((response) => {
      return response;
    });
  }

  linkMember(formdata: LinkMemberData): Observable<LinkMemberResponse> {
    return this.http.post<LinkMemberResponse>(this.LINK_MEMEBER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  unlinkMember(formdata: LinkMemberData): Observable<LinkMemberResponse> {
    return this.http.post<LinkMemberResponse>(this.UNLINK_MEMEBER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  requestKYB(businessHandle: string): Observable<KYBResponse> {
    return this.http.post<KYBResponse>(this.REQUEST_KYB_URL, { businessHandle }).pipe((response) => {
      return response;
    });
  }

  certifyBeneficialOwner(data: CertifyBeneficialOwnerRequest): Observable<CertifyBeneficialOwnerResponse> {
    return this.http.post<CertifyBeneficialOwnerResponse>(this.CERTIFY_BENEFICIAL_OWNER_URL, data).pipe((response) => {
      return response;
    });
  }

  certifyBusiness(data: CertifyBusinessRequest): Observable<CertifyBusinessResponse> {
    return this.http.post<CertifyBusinessResponse>(this.CERTIFY_BUSINESS_URL, data).pipe((response) => {
      return response;
    });
  }

  getEntity(userHandle: string): Observable<BusinessGetEntitiyResponse> {
    return this.http
      .get<BusinessGetEntitiyResponse>(this.GET_ENTITY_URL, { params: { userHandle } })
      .pipe((response) => {
        return response;
      });
  }
}
