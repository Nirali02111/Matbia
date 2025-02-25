import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RequestCardPopupComponent } from '@matbia/matbia-shared-popup/request-card-popup/request-card-popup.component';
import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { Params } from '@enum/Params';
import { ActivateCardPopupComponent } from '../activate-card-popup/activate-card-popup.component';
import { LandingModuleService } from '../landing-module.service';
import { UserApiService } from '@services/API/user-api.service';
import { PDFViewPopupComponent } from '@matbia/matbia-shared-popup/pdfview-popup/pdfview-popup.component';

declare const bootstrap: any;

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [SharedModule],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  isSticky = false;

  isHideHeder = false;
  isHeaderHome = false;

  isPlainHeader = false;

  isShulkiosk = false;

  activeUrlValue!: string;

  modalOptions?: NgbModalOptions;
  public currentYear: number = new Date().getFullYear();
  selectedOption: { id: string; label: string } | undefined;
  options = [
    { id: 1, label: 'Login' },
    { id: 2, label: 'Signup' },
  ];
  cardSettingActiveTabNumber = 1;

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    this.isSticky = window.pageYOffset >= 250;
  }

  isCollapsed = false;
  bsCollapse: any;

  constructor(
    private localStorageDataService: LocalStorageDataService,
    private modalService: NgbModal,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private moduleService: LandingModuleService,
    private userApiService: UserApiService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.url.indexOf('signup-card') !== -1 ||
          event.url.indexOf('signup') !== -1 ||
          event.url.indexOf('send-me-card') !== -1 ||
          event.url.indexOf('setup-card-setting') !== -1 ||
          event.url.indexOf('setup-org-setting') !== -1 ||
          event.url.indexOf('setup-alert-setting') !== -1 ||
          event.url.indexOf('setup-business') !== -1 ||
          event.url.indexOf('validate-organization') !== -1 ||
          event.url.indexOf('create-account') !== -1 ||
          event.url.indexOf('001242') !== -1 ||
          event.url.indexOf('send-me-email') !== -1 ||
          event.url.indexOf('enter-password') !== -1 ||
          event.url.indexOf('card-login') !== -1 ||
          event.url.indexOf('account-found') !== -1 ||
          event.url.indexOf('activate-card') !== -1
        ) {
          this.isHideHeder = true;

          if (event.url.indexOf('001242') !== -1) {
            this.isPlainHeader = true;
          }
        } else {
          this.isHideHeder = false;
          this.isPlainHeader = false;
        }
        this.activeUrlValue = event.url;
      }
    });

    if (this.activeRoute.firstChild?.routeConfig?.path === '') {
      this.isHeaderHome = true;
    }
  }

  ngAfterViewInit(): void {
    const myCollapse = document.getElementById('navbarSupportedContent');
    if (myCollapse) {
      this.bsCollapse = new bootstrap.Collapse(myCollapse, {
        toggle: false,
      });
    }
  }

  closeCollapse() {
    if (this.bsCollapse && this.bsCollapse.hide) {
      this.bsCollapse.hide();
    }
  }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.activeRoute.queryParamMap.subscribe((param) => {
      const value = param.get(Params.SHUL_KIOSK);
      if (value) {
        this.isShulkiosk = true;
      } else {
        this.isShulkiosk = false;
      }

      const activeStep = param.get(Params.ACTIVE_STEP);
      if (activeStep) {
        this.cardSettingActiveTabNumber = +activeStep;
      }
    });
  }

  isLoggedIn() {
    return this.localStorageDataService.isLoggedIn();
  }

  onActivateCard(event: any) {
    event.preventDefault();

    this.modalOptions = {
      centered: true,
      keyboard: false,
      windowClass: 'active-card-pop',
    };
    this.modalService.open(ActivateCardPopupComponent, this.modalOptions);
  }

  onRequestCard(event: any) {
    event.preventDefault();

    this.modalOptions = {
      centered: true,
      keyboard: false,
      windowClass: 'request-card-pop',
    };
    this.modalService.open(RequestCardPopupComponent, this.modalOptions);
  }

  openTerms(event: any) {
    event.preventDefault();
    this.modalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup',
      size: 'xl',
      scrollable: true,
    };
    this.modalService.open(TermsOfServicePopupComponent, this.modalOptions);
  }

  onBackClick(event: any) {
    event.preventDefault();

    if (this.activeUrlValue.indexOf('signup-card') !== -1) {
      this.moduleService.headerBackClick();
      return;
    }

    if (this.activeUrlValue.indexOf('setup-business') !== -1) {
      return;
    }

    if (this.activeUrlValue.indexOf('setup-card-setting') !== -1) {
      if (this.cardSettingActiveTabNumber === 1) {
        if (!this.isShulkiosk) {
          this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: { activeStep: 0 },
            queryParamsHandling: 'merge',
          });
          return;
        }

        if (this.isShulkiosk) {
          this.router.navigate(['/auth']);
          return;
        }

        return;
      }

      if (this.cardSettingActiveTabNumber === 2) {
        this.router.navigate([], {
          relativeTo: this.activeRoute,
          queryParams: { activeStep: 1 },
          queryParamsHandling: 'merge',
        });

        return;
      }

      this.router.navigate(['/auth']);
      return;
    }

    this.router.navigate(['/']);
    return;
  }

  onClickContact() {
    this.userApiService.contactRedirect.next(true);
  }

  openPatentPDF(event: any) {
    event.preventDefault();
    this.modalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'deposit-receipt-modal',
      size: 'lg',
      scrollable: true,
    };
    const modalRef = this.modalService.open(PDFViewPopupComponent, this.modalOptions);
    modalRef.componentInstance.title = 'Patent #20230214628';
    modalRef.componentInstance.pdfUrl = 'assets/files/Matbia Patent.pdf';
  }

  changeOrganization(event: any) {
    if (event.id == 1) {
      this.router.navigate(['/auth'], { state: { activeTab: 'organization' } });
      this.selectedOption = undefined;
    } else if (event.id == 2) {
      this.router.navigate(['/org-signup']);
      this.selectedOption = undefined;
    } else {
      this.selectedOption = undefined;
    }
  }

  Login() {
    this.router.navigate(['/auth'], { state: { activeTab: 'organization' } });
  }
}
