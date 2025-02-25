import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { DonorAPIService } from '@services/API/donor-api.service';
import { OrganizationAPIService } from '@services/API/organization-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-no-plaid',
  templateUrl: './no-plaid.component.html',
  styleUrls: ['./no-plaid.component.scss'],
  imports: [SharedModule],
})
export class NoPlaidComponent implements OnInit, AfterViewInit {
  isLoading = false;
  goToListPage = false;

  userHandleControl!: UntypedFormControl;
  setupAccountForm!: UntypedFormGroup;

  get userHandle() {
    return this.userHandleControl;
  }

  get nameRegisterWithBank() {
    return this.setupAccountForm.get('nameRegisterWithBank');
  }

  get FirstName() {
    return this.nameRegisterWithBank?.get('firstName');
  }

  get LastName() {
    return this.nameRegisterWithBank?.get('lastName');
  }

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private localStorage: LocalStorageDataService,
    private panelPopupService: PanelPopupsService,
    private pageRoute: PageRouteVariable,
    private matbiaDonorAPI: DonorAPIService,
    private orgAPIService: OrganizationAPIService
  ) {}

  ngOnInit(): void {
    this.activeRoute.queryParamMap.subscribe((param) => {
      const value = param.get('addFunds');
      this.goToListPage = !value ? true : false;
    });

    this.initForm();
  }

  ngAfterViewInit(): void {}

  goToBack() {
    return this.goToListPage ? this.pageRoute.getBankAccountsRouterLink() : this.pageRoute.getAddFundsRouterLink();
  }

  initForm() {
    const username = this.localStorage.getLoginUserUserName();

    this.userHandleControl = this.fb.control(username, Validators.compose([Validators.required]));

    this.setupAccountForm = this.fb.group({});

    this.setupAccountForm.addControl(
      'nameRegisterWithBank',
      this.fb.group({
        confirmName: this.fb.control(false, Validators.compose([Validators.required, Validators.requiredTrue])),
        firstName: this.fb.control('', Validators.compose([Validators.required])),
        lastName: this.fb.control('', Validators.compose([Validators.required])),
      })
    );

    if (this.localStorage.isDonor()) {
      this.getDonorInfo();
    } else {
      this.removeNameRegisterWithBankValidation();
      this.getOrganizationInfo();
    }
  }

  // Link bank
  getDonorInfo() {
    this.isLoading = true;
    this.matbiaDonorAPI.get(this.userHandle?.value).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.setupAccountForm.patchValue({
            nameRegisterWithBank: {
              firstName: res.firstName,
              lastName: res.lastName,
            },
          });

          this.setupAccountForm.updateValueAndValidity();

          this.openLinkPopup();
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
          this.openLinkPopup();
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

  openLinkPopup() {
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
      this.router.navigate(this.goToBack(), { queryParamsHandling: 'preserve' });
    });

    modal.closed.subscribe(() => {
      this.router.navigate(this.goToBack(), { queryParamsHandling: 'preserve' });
    });
  }
}
