import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  KYCDocumentType,
  BusinessType,
  NaicsCategories,
  BusinessRole,
  InstitutionObj,
  TransactionRecurrenceObj,
  MerchantObj,
} from '../../models/common-api-model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommonAPIMethodService {
  private version = 'v1/';
  private COMMON_METHOD_MAIN_URL = 'common';

  private KYC_DOCUMENT_TYPES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/KYCDocumentTypes`;

  private GET_BUSINESS_TYPES = `${this.version}${this.COMMON_METHOD_MAIN_URL}/BusinessTypes`;
  private GET_NAICS_CATEGORIES = `${this.version}${this.COMMON_METHOD_MAIN_URL}/NaicsCategories`;
  private GET_BUSINESS_ROLES = `${this.version}${this.COMMON_METHOD_MAIN_URL}/BusinessRoles`;

  private GET_INSTITUTIONS = `${this.version}${this.COMMON_METHOD_MAIN_URL}/Institutions`;

  private GET_SCHEDULE_STATUSES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/ScheduleStatuses`;

  private GET_TRANSACTION_RECURRENCES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/TransactionRecurrences`;

  private GET_MERCHANTS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetMerchants`;

  constructor(private http: HttpClient) {}

  documentTypesOfKYC(): Observable<Array<KYCDocumentType>> {
    return this.http.get<Array<KYCDocumentType>>(this.KYC_DOCUMENT_TYPES_URL).pipe((response) => {
      return response;
    });
  }

  getBusinessTypes(): Observable<Array<BusinessType>> {
    return this.http.get<Array<BusinessType>>(this.GET_BUSINESS_TYPES).pipe((response) => {
      return response;
    });
  }

  getNaicsCategories(): Observable<NaicsCategories> {
    return this.http.get<NaicsCategories>(this.GET_NAICS_CATEGORIES).pipe((response) => {
      return response;
    });
  }

  getBusinessRoles(): Observable<Array<BusinessRole>> {
    return this.http.get<Array<BusinessRole>>(this.GET_BUSINESS_ROLES).pipe((response) => {
      return response;
    });
  }

  getInstitutions(institutionName: string = ''): Observable<Array<InstitutionObj>> {
    return this.http
      .get<Array<InstitutionObj>>(this.GET_INSTITUTIONS, {
        params: {
          institutionName,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getScheduleStatuses(): Observable<Array<TransactionRecurrenceObj>> {
    return this.http.get<Array<TransactionRecurrenceObj>>(this.GET_SCHEDULE_STATUSES_URL).pipe((response) => {
      return response;
    });
  }

  getTransactionRecurrence(): Observable<Array<TransactionRecurrenceObj>> {
    return this.http.get<Array<TransactionRecurrenceObj>>(this.GET_TRANSACTION_RECURRENCES_URL).pipe((response) => {
      return response;
    });
  }

  getMerchants(userHandle: string): Observable<Array<MerchantObj>> {
    return this.http
      .get<Array<MerchantObj>>(this.GET_MERCHANTS_URL, {
        params: {
          userHandle,
        },
      })
      .pipe(
        map((response) => {
          if (!response) {
            return [];
          }

          return response.map((o) => {
            const isDonary = o.name && o.name.toLowerCase() === 'donary';
            const isCardknox = o.name && o.name.toLowerCase() === 'cardknox';

            return {
              ...o,
              isDonary: isDonary ? true : false,
              isCardknox: isCardknox ? true : false,
              isOther: !isDonary && !isCardknox,
            };
          });
        })
      );
  }
}
