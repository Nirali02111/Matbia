import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface expTokenSetting {
  settingId: number | null;
  settingName: string | null;
  settingStatus: boolean;
}
export interface saveTokenObj {
  settingId: number | null;
  text: string | null;
}
export interface SettingAPIObj {
  entityID: number;
  settingID: number;
  settingName: string;
  settingValue: string;
}

export interface generateTokenObj {
  settings: SettingAPIObj[];
}
@Injectable({
  providedIn: 'root',
})
export class SettingAPIService {
  private version = 'v1/';

  private SETTING_ROUTE = `${this.version}Setting`;
  private GET_ENTITY_SETTING_URL = `${this.SETTING_ROUTE}/GetEntitySetting`;
  private SET_TOKEN_EXP_SETTINGS = `${this.SETTING_ROUTE}/SaveSetting`;
  private GET_ALL_ENTITY_SETTINGS = `${this.SETTING_ROUTE}/GetAllEntitySettings`;

  constructor(private http: HttpClient) {}

  getEntitySetting(settingName: string): Observable<SettingAPIObj> {
    return this.http
      .get<SettingAPIObj>(this.GET_ENTITY_SETTING_URL, {
        params: {
          settingName,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  saveTokenExpSettings(formData: saveTokenObj): Observable<string> {
    return this.http.post<string>(this.SET_TOKEN_EXP_SETTINGS, formData).pipe((response) => {
      return response;
    });
  }

  getExpiredTokenSetting() {
    return this.getEntitySetting('ExpiredTokenSetting');
  }

  getAllEntitySettings() {
    return this.http.get<generateTokenObj>(this.GET_ALL_ENTITY_SETTINGS);
  }
}
