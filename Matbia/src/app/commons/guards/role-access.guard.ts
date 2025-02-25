import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { UserTypes } from '@enum/UserTypes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleAccessGuard {
  constructor(
    private localStorageDataService: LocalStorageDataService,
    private router: Router,
    private pageRouter: PageRouteVariable
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkUserType(route, state.url);
  }

  checkUserType(route: ActivatedRouteSnapshot, url: any): boolean {
    const currentUser = this.localStorageDataService.getLoginUserData();

    if (!currentUser) {
      this.router.navigate([PageRouteVariable.AuthMainUrl]);
      return false;
    }

    const userType = this.localStorageDataService.getLoginUserType();

    const reportUserData = this.localStorageDataService.getReportData();

    if (route.data.role && route.data.role.length !== 0 && route.data.role.indexOf(userType) === -1) {
      if (
        route.data.role.length === 1 &&
        route.data.role.indexOf(UserTypes.REPORT) !== -1 &&
        reportUserData &&
        reportUserData.userType === UserTypes.REPORT
      ) {
        return true;
      }

      this.router.navigate(this.pageRouter.getDashboardRouterLink());

      return false;
    }

    return true;
  }
}
