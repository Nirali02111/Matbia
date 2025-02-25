import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UpdateOrganizationPopupComponent } from 'src/app/pages/landing/popup/update-organization-popup/update-organization-popup.component';
import { CommonDataService } from '@commons/common-data-service.service';

@Injectable({
  providedIn: 'root',
})
export class NeedAuthGuardGuard {
  authUrl: string = '/' + PageRouteVariable.AuthMainUrl;
  private modalService = inject(NgbModal);
  private commonDataService = inject(CommonDataService);
  isUpdateOrganizationOpen: boolean = false;

  constructor(private router: Router, private localStorageDataService: LocalStorageDataService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.processLogin(state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.processLogin(state);
  }

  private processLogin(state: RouterStateSnapshot) {
    const currentUser = this.localStorageDataService.getLoginUserData();

    if (currentUser) {
      if (
        !this.localStorageDataService.isDisplayInfoComplete &&
        this.localStorageDataService.isOrganization() &&
        !this.commonDataService.isUpdateInfoPopupOpen()
      ) {
        this.commonDataService.isUpdateInfoPopupOpen.set(true);
        const modalRef = this.openUpdateOrganizationInfoPopup();
        this.commonDataService.updateInfoPopupRef.set(modalRef);
      }
      return true;
    }

    if (state.url) {
      this.router.navigate([this.authUrl], { queryParams: { returnUrl: state.url } });
    }
    return false;
  }

  openUpdateOrganizationInfoPopup() {
    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'xl',
      centered: true,
      animation: true,
      windowClass: 'modal-info',
    };
    return this.modalService.open(UpdateOrganizationPopupComponent, modalOptions);
  }
}
