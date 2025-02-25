import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import IdleJs from 'idle-js';
import { LocalStorageDataService } from './local-storage-data.service';
import { PageRouteVariable } from './page-route-variable';
import { MatbiaObserverService } from './matbia-observer.service';

@Injectable({
  providedIn: 'root',
})
export class MatbiaIdleService {
  private _idle$ = new Subject<boolean>();

  private _sleep$ = new Subject<boolean>();

  private _wakeUp$ = new Subject<boolean>();

  get idle$() {
    return this._idle$.asObservable();
  }

  get sleep$() {
    return this._sleep$.asObservable();
  }

  get wakeUp$() {
    return this._wakeUp$.asObservable();
  }

  /**
   * Idle Time limit in millisecond
   *
   */
  private idleTime = 840000; //14 min

  private jsObj: IdleJs;

  constructor(
    private router: Router,
    private localStorageDataService: LocalStorageDataService,
    private modalService: NgbModal,
    private matbiaObeserverService: MatbiaObserverService
  ) {
    matbiaObeserverService.shulKiousk$.subscribe((isShulKiosk: boolean) => {
      if (isShulKiosk) this.idleTime = 30000; // 30 seconds;
    });
    this.jsObj = new IdleJs({
      onIdle: () => {
        this._idle$.next(true);
      },
      onActive: () => {},
      onHide: () => {
        this._sleep$.next(true);
        this._wakeUp$.next(false);
      },
      onShow: () => {
        this._wakeUp$.next(true);
        this._sleep$.next(false);
      },
      idle: this.idleTime,
      keepTracking: true,
    });
  }

  startActivity() {
    this.jsObj.start();
  }

  resetActivity() {
    this.jsObj.stop().reset();
  }

  stopActivity() {
    this.jsObj.stop();
  }

  revertIdle() {
    this._idle$.next(false);
  }

  signOut() {
    this.stopActivity();
    this.modalService.dismissAll();
    this.localStorageDataService.logoutSession();
    this.router.navigateByUrl(`/${PageRouteVariable.AuthLoginUrl}`, { onSameUrlNavigation: 'reload' });
  }
}
