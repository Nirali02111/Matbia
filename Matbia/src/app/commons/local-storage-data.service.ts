import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserTypes } from '../enum/UserTypes';
import { generateTokenObj, SettingAPIObj } from '@services/API/setting-api.service';
import { TokenResponse } from '@services/API/donor-token-api.service';

interface UserStored {
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

  orgLogo: string | null;

  businessName?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageDataService {
  private userStoragekey = 'user_storage';
  private accessTokenKey = 'accesstoken';
  private refreshTokenKey = 'refreshtoken';
  private reportDataKey = 'reportData';
  // immediate-Funding
  private immediateFundingKey = 'immediate_funding';

  private skipBankAccountLinkedKey = 'isSkipBankAccountLinked';

  private processTokenKey = 'processTokenList';

  private entitySettingKey = 'entitySetting';

  private entityTokenSettingKey = 'entityTokenSetting';

  private messageSource = new BehaviorSubject(false);

  private requestsCount$: Subject<number> = new Subject();

  private settingsToken: string = 'tokenSetting';

  private userCardOrEmailValue: string = 'userCardOrEmailValue';

  private userCardFromEmailValue: string = 'userCardFromEmailValue';

  private isCardFromEmail: string = 'isCardFromEmail';

  private sendEmailCardValue: string = 'sendEmailCardValue';

  private generateTokenAccess: string = 'generateTokenAccess';

  currentMessage = this.messageSource.asObservable();

  requestCount = this.requestsCount$.asObservable();

  constructor() {}

  setLoginUserDataAndToken(userdata: any) {
    localStorage.setItem(this.userStoragekey, JSON.stringify(userdata));
    this.setTokenExpiryTime(userdata !== null && userdata !== '' ? userdata.expiresIn : 0);
    this.setAccessToken(userdata !== null && userdata !== '' ? userdata.accessToken : '');
    this.setRefreshToken(userdata !== null && userdata !== '' ? userdata.refreshToken : '');
  }

  setUserCardOrEmailValue(obj: object) {
    localStorage.setItem(this.userCardOrEmailValue, JSON.stringify(obj));
  }

  getUserCardOrEmailValue() {
    return JSON.parse(localStorage.getItem('userCardOrEmailValue') || '{}');
  }

  setUserCardFromEmailValue(obj: object) {
    localStorage.setItem(this.userCardFromEmailValue, JSON.stringify(obj));
  }

  getUserCardFromEmailValue() {
    return JSON.parse(localStorage.getItem('userCardFromEmailValue') || '{}');
  }

  setCardFromEmail(val: any) {
    localStorage.setItem(this.isCardFromEmail, val);
  }

  setSendEmailCardValue(val: any) {
    localStorage.setItem(this.sendEmailCardValue, val);
  }

  getSendEmailCardValue() {
    return localStorage.getItem(this.sendEmailCardValue);
  }

  getCardFromEmail() {
    return localStorage.getItem(this.isCardFromEmail);
  }

  removeUserCardOrEmailValue() {
    return localStorage.removeItem(this.userCardOrEmailValue);
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem(this.accessTokenKey, accessToken);
  }

  setSettingsToken(settingToken: string) {
    localStorage.setItem(this.settingsToken, settingToken);
  }

  getSettingsToken() {
    const val = localStorage.getItem(this.settingsToken);

    return !!val ? val : 'Token Request';
  }
  setRefreshToken(refreshToken: string) {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  setReportData(obj: UserStored | null) {
    if (!obj) {
      return;
    }

    localStorage.setItem(this.reportDataKey, JSON.stringify(obj));
  }

  clearReportData() {
    localStorage.removeItem(this.reportDataKey);
  }

  setTokenExpiryTime(expiryTime: any) {
    const expiresAt = moment().add(expiryTime, 'second');
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }

  setIsBankAccountLinked(): boolean {
    const userdata = this.getLoginUserData();
    if (!userdata) {
      return false;
    }

    localStorage.setItem(
      this.userStoragekey,
      JSON.stringify({
        ...userdata,
        isBankAccountLinked: true,
      })
    );

    return true;
  }

  getIsSkipBankAccountLinked() {
    return localStorage.getItem(this.skipBankAccountLinkedKey);
  }

  setIsSkipBankAccountLinked() {
    localStorage.setItem(this.skipBankAccountLinkedKey, JSON.stringify(true));
  }

  setIsCardSettingsSaved() {
    const userdata = this.getLoginUserData();
    if (!userdata) {
      return false;
    }

    localStorage.setItem(
      this.userStoragekey,
      JSON.stringify({
        ...userdata,
        isCardSettingsSaved: true,
      })
    );

    return true;
  }

  setIsProfileComplete() {
    const userdata = this.getLoginUserData();
    if (!userdata) {
      return false;
    }

    localStorage.setItem(
      this.userStoragekey,
      JSON.stringify({
        ...userdata,
        isProfileComplete: true,
      })
    );

    return true;
  }

  setFirstNameAndLastName(data: { firstName: string; lastName: string }) {
    const userdata = this.getLoginUserData();
    if (!userdata) {
      return false;
    }

    localStorage.setItem(
      this.userStoragekey,
      JSON.stringify({
        ...userdata,
        firstName: data.firstName,
        lastName: data.lastName,
      })
    );

    return true;
  }

  setBusinessName(data: { businessName: string }) {
    const userdata = this.getLoginUserData();
    if (!userdata) {
      return false;
    }

    localStorage.setItem(
      this.userStoragekey,
      JSON.stringify({
        ...userdata,
        businessName: data.businessName,
      })
    );

    return true;
  }

  getLoginUserData(): UserStored | null {
    const data = localStorage.getItem(this.userStoragekey);
    if (data && data !== 'null') {
      return JSON.parse(data);
    }
    return null;
  }

  getReportData(): UserStored | null {
    const data = localStorage.getItem(this.reportDataKey);

    if (data && data !== 'null') {
      try {
        return JSON.parse(data);
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  getLoginUserUserName() {
    const data = this.getLoginUserData();
    if (data) {
      return data.userName;
    }
    return '';
  }

  getLoginUserEmail(): string {
    const data = this.getLoginUserData();
    if (data) {
      return data.email;
    }

    return '';
  }

  getLoginUserEntityType(): string {
    const data = this.getLoginUserData();
    if (data) {
      return data.entityType;
    }

    return '';
  }

  getLoginUserFullName() {
    const data = this.getLoginUserData();
    if (data) {
      return `${data.firstName || ''} ${data.lastName || ''}`;
    }

    return '';
  }

  getLoginUserBusinessName() {
    const data = this.getLoginUserData();
    if (data) {
      return data.businessName || '';
    }

    return '';
  }

  getLoginUserId() {
    const data = this.getLoginUserData();
    if (data) {
      return data.entityId;
    }
    return '';
  }

  getUserFirstName() {
    const data = this.getLoginUserData();
    if (data) {
      return data.firstName;
    }
    return '';
  }

  getLoginUserAccountHash() {
    const data = this.getLoginUserId();
    if (data) {
      return `001242${data}`;
    }
    return '';
  }

  getLoginUserEncryptedId() {
    const data = this.getLoginUserData();
    if (data) {
      return data.encryptedEntityId;
    }
    return '';
  }

  getLoginUserOrgLogo() {
    const data = this.getLoginUserData();
    if (data) {
      return data.orgLogo;
    }

    return '';
  }

  getLoginUserAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  getLoginUserRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getTokenExpiryTime() {
    return localStorage.getItem('expires_at');
  }

  isLoggedIn() {
    const expValue = this.getExpiration();
    if (!expValue) {
      return false;
    }
    return moment().isBefore(expValue);
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at') || '';
    if (!expiration) {
      return false;
    }
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  changeMessage(success: boolean) {
    this.messageSource.next(success);
  }

  getLoginUserType(): string {
    const data = this.getLoginUserData();
    if (data) {
      return data.userType;
    }

    return '';
  }

  isBusiness(): boolean {
    if (this.getLoginUserType() === UserTypes.BUSINESS) {
      return true;
    }
    return false;
  }

  isOrganization(): boolean {
    if (this.getLoginUserType() === UserTypes.ORGANIZATION) {
      return true;
    }
    return false;
  }

  isBusinessDonor() {
    if (this.getLoginUserType() === UserTypes.BUSINESS_DONOR) {
      return true;
    }
    return false;
  }

  isDonor(): boolean {
    if (this.getLoginUserType() === UserTypes.DONOR) {
      return true;
    }
    return false;
  }

  isReport(): boolean {
    if (this.getLoginUserType() === UserTypes.REPORT) {
      return true;
    }
    return false;
  }

  // Immediate

  getImmediateFunding() {
    const data = localStorage.getItem(this.immediateFundingKey);
    if (data && data !== 'null') {
      return JSON.parse(data);
    }
    return null;
  }

  setImmediateFunding(apiData: any) {
    localStorage.setItem(this.immediateFundingKey, JSON.stringify(apiData));
  }

  clearImmediateFunding() {
    this.setImmediateFunding(null);
  }

  setIsRedirectFromVoucherPage(value: string) {
    localStorage.setItem('isRedirectFromVoucherPage', value);
  }

  getIsRedirectFromVoucherPage() {
    return localStorage.getItem('isRedirectFromVoucherPage');
  }

  setProcessTokenListData(arr: Array<any>) {
    localStorage.setItem(this.processTokenKey, JSON.stringify(arr));
  }

  getProcessTokenListData() {
    const listArray = localStorage.getItem(this.processTokenKey);
    if (listArray) {
      try {
        return JSON.parse(listArray);
      } catch (error) {
        return [];
      }
    }

    return [];
  }

  setEntitySetting(settingObj: SettingAPIObj) {
    localStorage.setItem(this.entitySettingKey, JSON.stringify(settingObj));
  }

  setEntityTokenSetting(settingObj: TokenResponse) {
    localStorage.setItem(this.entityTokenSettingKey, JSON.stringify(settingObj));
  }

  removeEntityTokenSetting() {
    localStorage.removeItem(this.entityTokenSettingKey);
  }

  getEntitySetting(): SettingAPIObj | null {
    const data = localStorage.getItem(this.entitySettingKey);
    if (data && data !== 'null') {
      return JSON.parse(data);
    }
    return null;
  }

  getEntityTokenSetting(): TokenResponse | null {
    const data = localStorage.getItem(this.entityTokenSettingKey);
    if (data && data !== 'null') {
      return JSON.parse(data);
    }
    return null;
  }

  logoutSession() {
    this.setLoginUserDataAndToken(null);
    localStorage.removeItem('sidebarMenu');
    localStorage.removeItem(this.skipBankAccountLinkedKey);
    localStorage.removeItem(this.entitySettingKey);
  }

  setReuestsCount(count: number) {
    localStorage.setItem('requestsCount', count.toString());
    this.requestsCount$.next();
  }

  get requestsCount() {
    return +(localStorage.getItem('requestsCount') || '0');
  }

  removeReuestsCount() {
    localStorage.removeItem('requestsCount');
  }

  setDisplayInfo(isDisplayinfoComplete: boolean) {
    localStorage.setItem('isDisplayInfoComplete', JSON.stringify(isDisplayinfoComplete));
  }

  get isDisplayInfoComplete() {
    const displayInfoStatus = localStorage.getItem('isDisplayInfoComplete');
    return JSON.parse(displayInfoStatus!);
  }

  setGenerateTokenInfo(value: boolean) {
    localStorage.setItem(this.generateTokenAccess, JSON.stringify(value));
  }

  getGenerateTokenInfo() {
    return localStorage.getItem(this.generateTokenAccess) === 'true';
  }
}
