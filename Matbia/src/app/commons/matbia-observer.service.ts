import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Params } from '@enum/Params';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageDataService } from './local-storage-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MatbiaObserverService {
  private channel!: BroadcastChannel;

  private _shulKiousk$ = new BehaviorSubject<boolean>(false);
  private _blockBankManagement$ = new BehaviorSubject<boolean>(false);
  private _blockPlaid$ = new BehaviorSubject<boolean>(false);
  private _isEntityId$ = new BehaviorSubject<boolean>(false);
  private _isBatchVisible$ = new BehaviorSubject<boolean>(false);

  private _isDevMode$ = new BehaviorSubject<boolean>(false);
  private _isProdMode$ = new BehaviorSubject<boolean>(false);
  private _isQAMode$ = new BehaviorSubject<boolean>(false);

  public _isUnSelectedRows$ = new BehaviorSubject<boolean>(false);

  get shulKiousk$() {
    return this._shulKiousk$.asObservable();
  }

  get blockBankManagement$() {
    return this._blockBankManagement$.asObservable();
  }

  get blockPlaid$() {
    return this._blockPlaid$.asObservable();
  }

  get batchVisible$() {
    return this._isBatchVisible$.asObservable();
  }

  get devMode$() {
    return this._isDevMode$.asObservable();
  }
  get prodMode$() {
    return this._isProdMode$.asObservable();
  }

  get qaMode$() {
    return this._isQAMode$.asObservable();
  }

  get isEnitityId$() {
    return this._isEntityId$.asObservable();
  }

  constructor(private activeRoute: ActivatedRoute, private localStorageData: LocalStorageDataService) {
    this.activeRoute.queryParamMap.subscribe((param) => {
      const value = param.get(Params.SHUL_KIOSK);
      if (value) {
        this._shulKiousk$.next(true);
      } else {
        this._shulKiousk$.next(false);
      }

      if (param.has(Params.BLOCK_BANK_MANAGEMENT)) {
        const bankValue = String(param.get(Params.BLOCK_BANK_MANAGEMENT)).toLowerCase() === 'true' ? true : false;
        this._blockBankManagement$.next(bankValue);
      }

      if (param.has(Params.BLOCK_PLAID)) {
        const plaidValue = String(param.get(Params.BLOCK_PLAID)).toLowerCase() === 'true' ? true : false;
        this._blockPlaid$.next(plaidValue);
      }
    });

    this.updateIsBatchVisible();

    this._isDevMode$.next(environment.baseUrl.includes('https://matbiabackendapidev.azurewebsites.net'));
    this._isProdMode$.next(environment.baseUrl.includes('https://api.matbia.org'));
    this._isQAMode$.next(environment.baseUrl.includes('https://matbiabackendapiqa.azurewebsites.net'));

    this.channel = new BroadcastChannel('new-login');
  }

  broadCastMessage(message: any) {
    this.channel.postMessage(message);
  }

  getMessage() {
    return new Observable<any>((observer) => {
      this.channel.onmessage = (event) => {
        observer.next(event.data);
      };
    });
  }

  setIsEntityId(value: boolean) {
    this._isEntityId$.next(value);
  }

  updateIsBatchVisible() {
    const data = this.localStorageData.getEntitySetting();

    this._isBatchVisible$.next(true);
  }
}
