import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { Params } from '@enum/Params';
import { Observable, Subject } from 'rxjs';

type CardSettingParams = {
  userHandle: string;
  activeStep?: number;
  isFromSendMeCard?: boolean;
};

@Injectable()
export class LandingModuleService {
  private headerBackObs = new Subject<{ isHeaderBackArrowClick: boolean }>();
  constructor(private router: Router) {}

  get CardSettingPage() {
    return [`/setup-card-setting`];
  }

  get OrgSettingPage() {
    return [`/setup-org-setting`];
  }

  headerBackClick() {
    this.headerBackObs.next({ isHeaderBackArrowClick: true });
  }

  getHeaderBack(): Observable<{ isHeaderBackArrowClick: boolean }> {
    return this.headerBackObs;
  }

  goToCardSettingPage(queryParams: CardSettingParams, state?: any) {
    this.router.navigate(this.CardSettingPage, {
      queryParams,
      queryParamsHandling: 'merge',
      state,
    });
  }

  goToOrgSettingPage(queryParams: CardSettingParams) {
    this.router.navigate(this.OrgSettingPage, {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  get DashboardUrlString() {
    return '/' + PageRouteVariable.DashboardUrl;
  }

  get DashboardWithShulKioskString() {
    return this.DashboardUrlString + `?${Params.SHUL_KIOSK}=true`;
  }
}
