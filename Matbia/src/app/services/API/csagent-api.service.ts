import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticatedUserResponse } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RecentAgentLogin {
  auditLogId: number;
  action: string;
  actionDate: string;
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CSAgentAPIService {
  private version = 'v1/';

  private CS_AGENT_URL = `${this.version}CSAgent`;

  private GET_CS_AGENT_LOGIN_URL = this.CS_AGENT_URL + '/CSAgentLogin';

  private GET_CS_AGENT_RECENT_LOGIN_URL = this.CS_AGENT_URL + '/GetCSAgentRecentLogs';
  private GET_CS_AGENT_LOGOUT_URL = this.CS_AGENT_URL + '/CSAgentLogout';
  constructor(private http: HttpClient) {}

  getAgentLogin(donorHandle: string): Observable<AuthenticatedUserResponse> {
    return this.http
      .get<AuthenticatedUserResponse>(this.GET_CS_AGENT_LOGIN_URL, {
        params: {
          donorHandle,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getRecentAgentLogin(agentHandle: string): Observable<Array<RecentAgentLogin> | null> {
    return this.http
      .get<Array<RecentAgentLogin> | null>(this.GET_CS_AGENT_RECENT_LOGIN_URL, {
        params: {
          agentHandle,
        },
      })
      .pipe(
        map((res) => {
          if (res && res.length !== 0) {
            return res.map((o) => {
              const splitArr = o.action.includes('v1') ? o.action.split('v1/') : o.action.split('v2/');
              const formattedAction = splitArr[1].split(/(?=[A-Z])/).join(' ');
              const Action = formattedAction.replace(/\//g, '');
              return {
                ...o,
                action: Action || '',
              };
            });
          }
          return [];
        })
      );
  }

  CSAgentlogout(): Observable<any> {
    return this.http.get<any>(this.GET_CS_AGENT_LOGOUT_URL);
  }
}
