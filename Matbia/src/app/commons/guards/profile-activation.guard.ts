import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageDataService } from '../local-storage-data.service';
import { CommonDataService } from '@commons/common-data-service.service';
import { Params } from '@enum/Params';

@Injectable({
  providedIn: 'root',
})
export class ProfileActivationGuard  {
  constructor(
    private router: Router,
    private commonDataService: CommonDataService,
    private localStorageDataService: LocalStorageDataService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.localStorageDataService.getLoginUserData();

    if (!currentUser) {
      return false;
    }

    if (this.localStorageDataService.isDonor()) {
      const queryParams = {
        ...route.queryParams,
        userHandle: currentUser.userName,
      };

      const isSkipBankAccountLinked = this.localStorageDataService.getIsSkipBankAccountLinked();

      if (isSkipBankAccountLinked) {
        return true;
      }

      if (this.checkIsHaveBlockBankManagementParam(route)) {
        return true;
      }

      if (!currentUser.isBankAccountLinked) {
        this.router.navigate([`/setup-card-setting`], {
          queryParams: { ...queryParams, activeStep: 2 },
          queryParamsHandling: 'merge',
        });
        return false;
      }

      return true;
    }

    if (this.localStorageDataService.isOrganization() || this.localStorageDataService.isBusiness()) {
      const queryParams = {
        ...route.queryParams,
        userHandle: currentUser.userName,
      };

      const isSkipBankAccountLinked = this.localStorageDataService.getIsSkipBankAccountLinked();

      if (isSkipBankAccountLinked) {
        return true;
      }

      if (!currentUser.isBankAccountLinked) {
        this.router.navigate([`/setup-org-setting`], {
          queryParams: { ...queryParams },
          queryParamsHandling: 'merge',
        });
        return false;
      }
    }

    return true;
  }

  private checkIsHaveBlockBankManagementParam(route: ActivatedRouteSnapshot) {
    if (route.queryParams[Params.BLOCK_BANK_MANAGEMENT]) {
      const value = route.queryParams[Params.BLOCK_BANK_MANAGEMENT];
      return this.commonDataService.isStringTrue(value);
    }

    return false;
  }
}
