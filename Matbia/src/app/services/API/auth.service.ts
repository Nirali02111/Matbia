import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResetPassword } from './../../models/login-model';

export interface ContactUSPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface AuthenticatedUserResponse {
  entityId: number;
  email: string;
  firstName: string;
  lastName: string;
  entityType: string;
  birthDate: string;
  timeZone: string;
  isActive: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userName: string;
  accountType: string;
  isBankAccountLinked: boolean | null;
  isCardSettingsSaved: boolean | null;
  isProfileComplete: boolean | null;
  encryptedCardId: string;
  encryptedEntityId: string;
  userType: string;
}
export interface validateLoginPayload {
  cardNum: string | null;
  email: string | null;
}
export interface validateLoginRresponse {
  hasEmail: boolean | null;
  hasPassword: boolean | null;
  cardIsActive: boolean | null;
  cardIsPrepaid: boolean | null;
  cardIsInactive: boolean | null;
  otherEmail: string | null;
}

export interface SetPasswordPayload {
  userHandle?: string;
  email?: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  version = 'v1/';
  private AUTHENTICATION_URL = `${this.version}Auth`;
  private LOGIN_URL = this.AUTHENTICATION_URL;
  private REFRESH_TOKEN_URL = this.AUTHENTICATION_URL + '/refresh-token';

  private RESET_PASSWORD_URL = this.AUTHENTICATION_URL + '/ResetPassword';

  private MATBIA_CARD_LOGIN_URL = this.AUTHENTICATION_URL + '/MatbiaCardLogin';
  private FORGOT_PASSWORD_URL = this.AUTHENTICATION_URL + '/ForgotPassword';

  private CONTACTUS_EMAIL_URL = this.AUTHENTICATION_URL + '/ContactUs';

  private SHULKIOSK_SET_PASSWORD_URL = this.AUTHENTICATION_URL + '/ShulKiosk/SetPassword';

  private SAVE_GOOGLE_TOKEN_URL = this.AUTHENTICATION_URL + '/SaveGoogleToken';
  private GOOGLE_LOGIN_URL = this.AUTHENTICATION_URL + '/GoogleLogin';
  private VALIDATE_LOGIN_URL = this.AUTHENTICATION_URL + '/ValidateLogin';

  private SET_PASSWORD_URL = this.AUTHENTICATION_URL + '/SetPassword';

  constructor(private http: HttpClient) {}

  login(formdata: any): Observable<AuthenticatedUserResponse> {
    return this.http.post<AuthenticatedUserResponse>(this.LOGIN_URL, formdata).pipe((response) => {
      return response;
    });
  }

  refreshToken(modelData: any) {
    return this.http.post(this.REFRESH_TOKEN_URL, modelData).pipe((response) => {
      return response;
    });
  }

  resetPassword(modelData: ResetPassword): Observable<{}> {
    return this.http.post<{}>(this.RESET_PASSWORD_URL, modelData).pipe((response) => {
      return response;
    });
  }

  matbiaCardLogin(formdata: { matbiaCardNum?: string; pin: string; cardId?: string }): Observable<any> {
    return this.http.post(this.MATBIA_CARD_LOGIN_URL, formdata).pipe((response) => {
      return response;
    });
  }

  forgotPassword(email: string, token: string): Observable<any> {
    return this.http
      .put(this.FORGOT_PASSWORD_URL, {
        email,
        reCaptcha: token,
      })
      .pipe((response) => {
        return response;
      });
  }

  contactUsMail(data: ContactUSPayload): Observable<any> {
    return this.http.post(this.CONTACTUS_EMAIL_URL, data).pipe((response) => {
      return response;
    });
  }

  shulKioskSetPassword(data: { userHandle: string; email: string }): Observable<string> {
    return this.http.put<string>(this.SHULKIOSK_SET_PASSWORD_URL, data).pipe((response) => {
      return response;
    });
  }

  saveGoogleLogin(data: { email: string; token: string }): Observable<string> {
    return this.http.post<string>(this.SAVE_GOOGLE_TOKEN_URL, data).pipe((response) => {
      return response;
    });
  }

  googleLogin(data: { email: string; token: string }): Observable<AuthenticatedUserResponse> {
    return this.http.post<AuthenticatedUserResponse>(this.GOOGLE_LOGIN_URL, data).pipe((response) => {
      return response;
    });
  }
  validateLogin(formdata: validateLoginPayload): Observable<validateLoginRresponse> {
    return this.http.post<validateLoginRresponse>(this.VALIDATE_LOGIN_URL, formdata).pipe((response) => {
      return response;
    });
  }

  SetPassword(data: SetPasswordPayload): Observable<string> {
    return this.http.post<string>(this.SET_PASSWORD_URL, data).pipe((response) => {
      return response;
    });
  }
}
