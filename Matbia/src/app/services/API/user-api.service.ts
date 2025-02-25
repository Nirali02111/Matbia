import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserRegisterPayload, RegisterResponse, UploadDocumentResponse } from '../../models/login-model';
import { EntitiyList } from '../../models/common-api-model';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  version = 'v1/';

  USER_URL = `${this.version}User`;
  REGISTER_URL = this.USER_URL + '/Register';
  KYC_CHECK_URL = `${this.USER_URL}/KYCCheck`;

  ENTITY_UPDATE_URL = `${this.USER_URL}/Update`;
  KYC_DOC_UPLOAD_URL = `${this.USER_URL}/UploadDocuments`;

  GET_ENTITIES_URL = `${this.USER_URL}/GetEntities`;
  RESET_PASSWORD_URL = `${this.USER_URL}​/ResetPassword`;

  contactRedirect = new Subject();

  constructor(private http: HttpClient) {}

  register(formdata: UserRegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.REGISTER_URL, formdata).pipe((response) => {
      return response;
    });
  }

  checkKYC(username: string): Observable<any> {
    return this.http.get(this.KYC_CHECK_URL, { params: { userName: username } }).pipe((response) => {
      return response;
    });
  }

  update(formdata: UserRegisterPayload): Observable<UploadDocumentResponse> {
    return this.http.put<UploadDocumentResponse>(this.ENTITY_UPDATE_URL, formdata).pipe((response) => {
      return response;
    });
  }

  uploadDocument(formdata: any): Observable<UploadDocumentResponse> {
    return this.http.post<UploadDocumentResponse>(this.KYC_DOC_UPLOAD_URL, formdata).pipe((response) => {
      return response;
    });
  }

  getEntities(): Observable<EntitiyList> {
    return this.http.get<EntitiyList>(this.GET_ENTITIES_URL, { params: { pageSize: 10000 } }).pipe((response) => {
      return response;
    });
  }
}
