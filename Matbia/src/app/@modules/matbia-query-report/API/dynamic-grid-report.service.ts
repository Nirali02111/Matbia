import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReportObj {
  entityId: null;
  reportId: number;
  reportName: string;
  reportParameters: null;
}

export interface IPResponse {
  ip: string;
}

export interface ParamObj {
  gridReportQueryId: number;
  gridReportQueryParamId: number;
  isRequired: boolean;
  isServerParam: boolean;
  paramName: string;
  parameterDisplayName: null;
  uiControl: string;
  uiDataType: string;
}

interface NameAndValue {
  name: string;
  value: string;
}

export interface ReportExePayload {
  reportId: number;
  params: Array<NameAndValue>;
}

export interface RepostItemObj {
  [key: string]: string;
}

export interface ReportExecuteResponse {
  table: Array<RepostItemObj>;
}

@Injectable()
export class DynamicGridReportService {
  private version = 'v1/';
  private DYNAMIC_GRID_REPORT_MAIN_URL = 'DynamicGridReport';
  private GET_ALL_REPORT_URL = `${this.version}${this.DYNAMIC_GRID_REPORT_MAIN_URL}/GetAll`;

  private GET_REPORT_PARAM_URL = `${this.version}${this.DYNAMIC_GRID_REPORT_MAIN_URL}/GetParams`;

  private REPORT_EXECUTE_URL = `${this.version}${this.DYNAMIC_GRID_REPORT_MAIN_URL}/Execute`;

  constructor(private http: HttpClient) {}

  getIPAddress() {
    return new Observable<IPResponse | null>((observer) => {
      fetch('https://jsonip.com/', {
        mode: 'cors',
      })
        .then((res) => {
          return res.json();
        })
        .then((res: IPResponse) => {
          observer.next(res);
        })
        .catch(() => {
          observer.next(null);
        });
    });
  }

  getAllReport(): Observable<Array<ReportObj>> {
    return this.http.get<Array<ReportObj>>(this.GET_ALL_REPORT_URL).pipe((response) => {
      return response;
    });
  }

  getReportParams(reportId: number): Observable<Array<ParamObj>> {
    return this.http
      .get<Array<ParamObj>>(this.GET_REPORT_PARAM_URL, {
        params: {
          reportId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  executeReport(data: ReportExePayload): Observable<ReportExecuteResponse> {
    return this.http.post<ReportExecuteResponse>(this.REPORT_EXECUTE_URL, data).pipe((response) => {
      return response;
    });
  }
}
