import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PageRouteVariable } from './commons/page-route-variable';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { NotificationService } from '@commons/notification.service';
import { AnalyticsService } from '@services/analytics.service';
import { Params } from '@enum/Params';
import { environment } from 'src/environments/environment';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaLoaderService, ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [SharedModule],
  providers: [
    ReCaptchaV3Service,
    RecaptchaLoaderService,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.RECAPTCHA_V3_SITE_KEY },
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  path = '';
  isHeaderMenuVisible = false;
  isSideMenuVisible = false;
  landingPageUrl = '/';
  authPageUrl: string = '/' + PageRouteVariable.AuthMainUrl;

  pledgePaymentloginUrl: string = '/' + PageRouteVariable.AuthRegisterUrl;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private matbiaObserver: MatbiaObserverService,
    private notification: NotificationService,
    private analytics: AnalyticsService,
    private localStorage: LocalStorageDataService
  ) {
    router.events.subscribe((val) => {
      this.UserLoggedInChangeEvent();
    });
  }

  ngOnInit(): void {
    this.activeRoute.queryParamMap.subscribe((params) => {
      if (
        (params.has(Params.UTM_CAMPAIGN) ||
          params.has(Params.UTM_MEDIUM) ||
          params.has(Params.UTM_SOURCE) ||
          params.has(Params.UTM_ID)) &&
        !environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER
      ) {
        const utm_c = params.get(Params.UTM_CAMPAIGN) as string;
        const utm_m = params.get(Params.UTM_MEDIUM) as string;
        const utm_s = params.get(Params.UTM_SOURCE) as string;
        const utm_id = params.get(Params.UTM_ID) as string;

        this.analytics.initCampaignDetails(utm_c as string, {
          campaign: utm_c,
          source: utm_s,
          medium: utm_m,
          id: utm_id,
        });
      }
    });

    const loginData = this.localStorage.getLoginUserData();

    if (loginData && !this.localStorage.isReport()) {
      this.watchInAlert();
    }
  }

  private watchInAlert() {
    this.matbiaObserver.getMessage().subscribe(
      (data) => {
        let popupText = `Session has ended, please logout`;
        const modalRef = this.notification.initWarningPopup('Alert', popupText);
        return modalRef.then((res) => {
          window.location.reload();
        });
      },
      (error) => {}
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  UserLoggedInChangeEvent() {
    this.path = window.location.pathname;
    const origin = window.location.origin;
    const isLandingPage = origin + this.path === origin + this.landingPageUrl;

    // below route is parent route and it has multiple children route
    if (isLandingPage || this.path.includes(this.authPageUrl) || this.path.includes(this.pledgePaymentloginUrl)) {
      this.isHeaderMenuVisible = false;
      this.isSideMenuVisible = false;
    } else {
      this.isHeaderMenuVisible = true;
      this.isSideMenuVisible = true;
    }
  }
}
