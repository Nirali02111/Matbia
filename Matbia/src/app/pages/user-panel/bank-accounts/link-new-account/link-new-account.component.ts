import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbCollapse, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import { combineLatest } from 'rxjs';

import { KYC_LEVEL, KYC_VERIFICATION_STATUS } from '@enum/KYC';

import { shakeTrigger } from '@commons/animations';
import { AbstractControlWarning, CustomValidator } from '@commons/custom-validator';

import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { PlaidButtonComponent } from '@matbia/plaid-link-button/plaid-button/plaid-button.component';

import { DonorAPIService } from '@services/API/donor-api.service';
import { OrganizationAPIService } from '@services/API/organization-api.service';

import { PanelPopupsService } from '../../popups/panel-popups.service';
import { Title } from '@angular/platform-browser';
import { AccountAPIService } from '@services/API/account-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ConnectToBankAccountComponent } from '@matbia/matbia-form-group/connect-to-bank-account/connect-to-bank-account.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-link-new-account',
  templateUrl: './link-new-account.component.html',
  styleUrls: ['./link-new-account.component.scss'],
  imports: [SharedModule, PlaidButtonComponent, ConnectToBankAccountComponent, InputErrorComponent],
  animations: [shakeTrigger],
})
export class LinkNewAccountComponent implements OnInit, AfterViewInit {
  public isCollapsed = true;

  @ViewChild('manuallyLinkBankTemplate') manuallyLinkBankTemplate!: NgbCollapse;
  isLoading = false;
  isShulkiosk = false;
  isBlockPlaid = false;
  isInLinking = false;
  inAnimation = false;

  goToListPage = false;
  reLinkBankId = '';

  userHandleControl!: UntypedFormControl;
  setupAccountForm!: UntypedFormGroup;

  matbiaCardSubmitButton = false;

  modalOptions?: NgbModalOptions;

  isEditNameCollapsed = true;

  maxDate: dayjs.Dayjs = dayjs().subtract(18, 'year');
  minDate: dayjs.Dayjs = dayjs().subtract(99, 'year');

  SSNhasFocus = true;

  sectionOneVisible = false;
  sectionTwoVisible = false;

  get userHandle() {
    return this.userHandleControl;
  }

  get nameRegisterWithBank(): AbstractControlWarning | null {
    return this.setupAccountForm.get('nameRegisterWithBank');
  }

  get FirstName() {
    return this.nameRegisterWithBank?.get('firstName');
  }

  get LastName() {
    return this.nameRegisterWithBank?.get('lastName');
  }

  get donateMore() {
    return this.setupAccountForm.get('donateMore');
  }

  get needToMoreTransfer() {
    return this.donateMore?.get('needMoreTransfer');
  }

  get BirthDate() {
    return this.donateMore?.get('birthDate');
  }

  get SSN() {
    return this.donateMore?.get('ssn');
  }

  get linkWith() {
    return this.setupAccountForm?.get('linkWith');
  }

  get haveUsernameAndPAssword() {
    return this.linkWith?.get('haveUsernameAndPAssword');
  }

  get confirmName() {
    return this.nameRegisterWithBank?.get('confirmName');
  }

  get isAggree() {
    return this.linkWith?.get('isAggree');
  }

  @ViewChild(PlaidButtonComponent) plaidLinkButton!: PlaidButtonComponent;

  constructor(
    protected title: Title,
    private fb: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private matbiaDonorAPI: DonorAPIService,
    private panelPopupService: PanelPopupsService,
    private localStorage: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private notificationService: NotificationService,
    private orgAPIService: OrganizationAPIService,
    private matbiaObserver: MatbiaObserverService,
    private accountAPI: AccountAPIService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Connect your bank');
    this.activeRoute.queryParamMap.subscribe((param) => {
      const value = param.get('addFunds');
      this.goToListPage = !value ? true : false;

      const reLinkBankId = param.get('reLinkBankId');
      if (reLinkBankId) {
        this.reLinkBankId = reLinkBankId;
      }
    });

    this.initForm();

    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      this.isShulkiosk = val;
    });

    combineLatest(
      this.matbiaObserver.shulKiousk$,
      this.matbiaObserver.blockBankManagement$,
      this.matbiaObserver.blockPlaid$,
      (shulKiousk, blockBankManagement, blockPlaid) => ({
        shulKiousk,
        blockBankManagement,
        blockPlaid,
      })
    ).subscribe((obj) => {
      if (obj.shulKiousk && obj.blockBankManagement) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
      }

      if (obj.shulKiousk && !obj.blockBankManagement && obj.blockPlaid) {
        this.isBlockPlaid = true;
      }
    });
  }

  ngAfterViewInit(): void {
    this.haveUsernameAndPAssword?.valueChanges.subscribe(() => {
      this.manuallyLinkBankTemplate.toggle();
    });
  }

  initForm() {
    const username = this.localStorage.getLoginUserUserName();

    this.userHandleControl = this.fb.control(username, Validators.compose([Validators.required]));

    this.setupAccountForm = this.fb.group({});

    this.setupAccountForm.addControl(
      'nameRegisterWithBank',
      this.fb.group({
        confirmName: this.fb.control(false, Validators.compose([Validators.required, Validators.requiredTrue])),
        firstName: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
        lastName: this.fb.control('', Validators.compose([Validators.required, CustomValidator.noHebrew()])),
      })
    );

    this.setupAccountForm.addControl(
      'donateMore',
      this.fb.group({
        needMoreTransfer: this.fb.control('0'),
        birthDate: this.fb.control(null, Validators.compose([Validators.required])),
        ssn: this.fb.control(null, Validators.compose([Validators.required, CustomValidator.ssnValidator])),
      })
    );

    this.setupAccountForm.addControl(
      'linkWith',
      this.fb.group({
        haveUsernameAndPAssword: this.fb.control('1'),
        isAggree: this.fb.control(false, Validators.compose([Validators.requiredTrue])),
      })
    );

    if (this.localStorage.isDonor()) {
      this.getDonorInfo();
    } else {
      this.removeNameRegisterWithBankValidation();
      this.getOrganizationInfo();
    }
  }

  private goToBack() {
    return this.goToListPage
      ? this.pageRoute.getBankAccountsRouterLink()
      : this.localStorage.isOrganization() || this.localStorage.isBusiness()
      ? this.pageRoute.getDashboardRouterLink()
      : this.pageRoute.getAddFundsRouterLink();
  }

  private navigation() {
    if (this.reLinkBankId) {
      this.router.navigate(this.goToBack());
      return;
    }
    this.router.navigate(this.goToBack(), { queryParamsHandling: 'preserve' });
  }

  removeNameRegisterWithBankValidation() {
    this.setupAccountForm.get('nameRegisterWithBank')?.get('firstName')?.clearValidators();
    this.setupAccountForm.get('nameRegisterWithBank')?.get('lastName')?.clearValidators();
    this.setupAccountForm.get('nameRegisterWithBank')?.get('confirmName')?.clearValidators();

    this.setupAccountForm.get('nameRegisterWithBank')?.get('firstName')?.updateValueAndValidity();
    this.setupAccountForm.get('nameRegisterWithBank')?.get('lastName')?.updateValueAndValidity();
    this.setupAccountForm.get('nameRegisterWithBank')?.get('confirmName')?.updateValueAndValidity();

    this.setupAccountForm.get('nameRegisterWithBank')?.updateValueAndValidity();
    this.setupAccountForm.updateValueAndValidity();
  }

  // Link bank
  getDonorInfo() {
    this.isLoading = true;
    this.matbiaDonorAPI.get(this.userHandle?.value).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (
            res.accountType &&
            res.accountType === KYC_LEVEL.DOC_KYC &&
            res.kycStatus === KYC_VERIFICATION_STATUS.PASSED
          ) {
            this.removeNameRegisterWithBankValidation();

            this.setupAccountForm.patchValue({
              nameRegisterWithBank: {
                firstName: res.firstName,
                lastName: res.lastName,
              },
            });

            this.setupAccountForm.updateValueAndValidity();
            return;
          }

          this.sectionOneVisible = true;
          this.sectionTwoVisible = false;

          this.setupAccountForm.patchValue({
            nameRegisterWithBank: {
              firstName: res.firstName,
              lastName: res.lastName,
            },
          });

          this.setupAccountForm.updateValueAndValidity();
        }
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  // Link bank
  getOrganizationInfo() {
    this.isLoading = true;
    const orgHandle = this.localStorage.getLoginUserUserName();
    this.orgAPIService.getOrganizationByUsername(orgHandle).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.setupAccountForm.patchValue({
            nameRegisterWithBank: {
              firstName: res.businessName,
              lastName: res.businessName,
            },
          });

          this.setupAccountForm.updateValueAndValidity();
        }
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  displayDonorFullName() {
    const fval = this.nameRegisterWithBank?.get('firstName')?.value;
    const lval = this.nameRegisterWithBank?.get('lastName')?.value;

    if (this.localStorage.isDonor()) {
      return `${fval} ${lval}`;
    }

    return `${fval}`;
  }

  openLinkPopup() {
    this.isInLinking = true;
    const modal = this.panelPopupService.openAddBankAccount({
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'link-via-Routing-popup',
    });

    modal.componentInstance.userHandle = this.userHandle?.value;
    modal.componentInstance.accountName = this.displayDonorFullName();
    modal.componentInstance.requestKYCFirst = false;

    modal.componentInstance.linked.subscribe(() => {
      if (this.reLinkBankId) {
        this.deleteBankAccount();
        return;
      }

      this.navigation();
    });

    modal.closed.subscribe(() => {
      this.isInLinking = false;
    });
  }

  openTerms(event: any) {
    event.preventDefault();
    if (this.isShulkiosk) {
      return;
    }
    this.panelPopupService.openTermsAndCondition();
  }

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  commonConnectButton(eventData: { isWithPlaid: boolean }) {
    if (this.nameRegisterWithBank?.invalid) {
      this.nameRegisterWithBank?.markAllAsTouched();

      this.triggerAnimation();
      return;
    }

    if (!this.isAggree?.value) {
      this.linkWith?.markAllAsTouched();

      this.triggerAnimation();

      return;
    }

    const { confirmName, ...restData } = this.nameRegisterWithBank?.value;

    let bodyData = { ...restData, userHandle: this.userHandle.value };

    if (this.needToMoreTransfer?.value && this.needToMoreTransfer?.value === '1') {
      if (this.donateMore?.invalid) {
        this.donateMore.markAllAsTouched();

        this.triggerAnimation();
        return;
      }

      const data = this.donateMore?.value;
      const { needMoreTransfer, birthDate, ...restValues } = data;

      bodyData = {
        ...bodyData,
        ...restValues,
        birthDate: birthDate.startDate.format('YYYY-MM-DD'),
      };
    }

    this.isLoading = true;
    this.matbiaDonorAPI.update(bodyData).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (res.errors && res.errors.length !== 0) {
            this.notificationService.showError(res.errors[0].error, 'Error !');
            return;
          }

          this.plaidOrRoutingProcess(eventData);
        }
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  private plaidOrRoutingProcess(eventData: { isWithPlaid: boolean }) {
    if (this.linkWith?.invalid) {
      this.linkWith?.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    this.isLoading = false;

    if (!eventData.isWithPlaid) {
      this.openLinkPopup();
      return;
    }

    // always open plaid
    this.plaidLinkButton.openLinkAccount();
    this.isInLinking = true;
    this.plaidLinkButton.linked.subscribe(() => {
      if (this.reLinkBankId) {
        this.deleteBankAccount();
        return;
      }

      this.navigation();
    });

    this.plaidLinkButton.exited.subscribe(() => {
      this.isInLinking = false;
    });
  }

  private deleteBankAccount() {
    const loginId = this.localStorage.getLoginUserId();
    const loader = this.notificationService.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.navigation();
        return;
      }
    });

    this.accountAPI.deleteBankAccount(this.reLinkBankId, loginId).subscribe(
      (res) => {
        this.notificationService.hideLoader();

        if (res.errors && res.errors.length !== 0) {
          this.notificationService.displayError(res.errors[0].error);
          return;
        }

        this.notificationService.displaySuccess(res.message);
      },
      (err) => {
        this.notificationService.throwError(err.error);
      }
    );
  }
}
