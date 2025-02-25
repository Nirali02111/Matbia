import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '@enum/Params';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, Subscription, of } from 'rxjs';
import { MatbiaIdleService } from '@commons/matbia-idle.service';
import { PanelPopupsService } from '../popups/panel-popups.service';
import { switchMap } from 'rxjs/operators';

import { SharedModule } from '@matbia/shared/shared.module';
import { HeaderComponent } from 'src/app/@theme/header/header.component';
import { SidebarMenuComponent } from 'src/app/@theme/sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-panel-layout',
  templateUrl: './panel-layout.component.html',
  styleUrls: ['./panel-layout.component.scss'],
  imports: [SharedModule, HeaderComponent, SidebarMenuComponent],
})
export class PanelLayoutComponent implements OnInit, OnDestroy {
  isShulKiosk = false;

  // isTablet: Observable<BreakpointState>;
  isWeb: Observable<BreakpointState>;
  // isMedium: Observable<BreakpointState>;

  idle$!: Observable<Boolean>;

  sleep$!: Observable<Boolean>;

  wakeUp$!: Observable<Boolean>;

  private _matbiaIdleSubscriptions: Subscription = new Subscription();

  private _matbiaTabWakeUpSubscriptions: Subscription = new Subscription();

  constructor(
    private activeRoute: ActivatedRoute,
    public breakpointObserver: BreakpointObserver,
    private matbiaIdleService: MatbiaIdleService,
    private popupService: PanelPopupsService,
    private router: Router
  ) {
    this.isWeb = this.breakpointObserver.observe(['(min-width: 1025px)']);
  }

  ngOnInit(): void {
    this.activeRoute.queryParamMap.subscribe((params) => {
      const hasShulKiosk = params.get(Params.SHUL_KIOSK);
      if (hasShulKiosk) {
        this.isShulKiosk = true;
      }
    });

    this.matbiaIdleService.startActivity();

    this._matbiaIdleSubscriptions = this.matbiaIdleService.idle$.pipe().subscribe((data) => {
      if (data) {
        this.startTimeoutSection();
      }
    });

    this._matbiaTabWakeUpSubscriptions = this.matbiaIdleService.idle$
      .pipe(
        switchMap((w) => {
          if (w) {
            return this.matbiaIdleService.wakeUp$;
          }
          return of(false);
        })
      )
      .pipe()
      .subscribe((isWakeUp) => {
        if (isWakeUp) {
          this.matbiaIdleService.signOut();
        }
      });
  }

  ngOnDestroy(): void {
    this._matbiaIdleSubscriptions.unsubscribe();
    this._matbiaTabWakeUpSubscriptions.unsubscribe();
    this.matbiaIdleService.resetActivity();
  }

  private startTimeoutSection() {
    const modalRef = this.popupService.openTimeoutPopup();

    modalRef.componentInstance.timeOutEvent.subscribe(() => {
      this.matbiaIdleService.signOut();
    });

    modalRef.componentInstance.stayInEvent.subscribe(() => {
      this.matbiaIdleService.revertIdle();
    });
  }

  isSearchBarHide() {
    return this.router.isActive('dashboard/add-funds', true) || this.router.isActive('dashboard/donate', false);
  }
}
