import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { BusinessUserFormGroupComponent } from '@matbia/matbia-form-group/business-user-form-group/business-user-form-group.component';
import { BusinessRegisterFormGroupComponent } from '@matbia/matbia-form-group/business-register-form-group/business-register-form-group.component';
import { AddBusinessPermissionFormGroupComponent } from '@matbia/matbia-form-group/add-business-permission-form-group/add-business-permission-form-group.component';

import { Params } from '@enum/Params';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { AuthService } from '@services/API/auth.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { DonorAPIService } from '@services/API/donor-api.service';
import { BusinessAPIService } from '@services/API/business-api.service';
import { BusinessLinkMemberAPIService, LinkedMember } from '@services/API/business-link-member-api.service';
import moment from 'moment';
import { Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-setup-business',
  templateUrl: './setup-business.component.html',
  styleUrls: ['./setup-business.component.scss'],
  imports: [SharedModule, AddBusinessPermissionFormGroupComponent, ButtonLoaderComponent],
  providers: [BusinessAPIService],
})
export class SetupBusinessComponent implements OnInit {
  @ViewChild('businessRegisterForm') businessRegisterForm!: BusinessRegisterFormGroupComponent;
  @ViewChild('businessUserFormGroup') businessUserFormGroup!: BusinessUserFormGroupComponent;
  @ViewChild('businessPermissionFormGroup') businessPermissionFormGroup!: AddBusinessPermissionFormGroupComponent;

  isbusinessSetup = false;
  isbusinessUserSetup = false;

  isLoading = false;
  activeId = 1;

  entityMemberLinkId!: number | null;
  businessForm!: UntypedFormGroup;
  businessUserForm!: UntypedFormGroup;
  businessPermissionForm!: UntypedFormGroup;

  businessName!: string;
  businessMemberList!: Array<LinkedMember>;

  get CardId() {
    return this.businessUserForm.get('cardId');
  }

  get BusinessEmail() {
    return this.businessForm.get('businessEmail');
  }

  constructor(
    protected title: Title,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private businessAPI: BusinessAPIService,
    private businessLinkAPI: BusinessLinkMemberAPIService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private notification: NotificationService,
    private donorAPIService: DonorAPIService,
    private localStorageService: LocalStorageDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Business Register');
    this.initControls();

    this.activeRoute.queryParamMap.subscribe((params) => {
      const cardId = params.get(Params.CARD_ID);

      if (cardId) {
        this.businessUserForm.patchValue({
          cardId,
        });

        this.businessUserForm.updateValueAndValidity();
      }

      const businessHandle = params.get(Params.BUSINESS_HANDLE);
      if (businessHandle) {
        this.businessPermissionForm.patchValue({
          businessHandle,
        });
        this.businessPermissionForm.updateValueAndValidity();
      }

      const activeStep = params.get(Params.ACTIVE_STEP);
      if (activeStep) {
        this.activeId = +activeStep;

        if (this.activeId === 2) {
          this.isbusinessSetup = true;
          setTimeout(() => {
            this.businessUserFormGroup.doFocus();
          }, 250);
        }

        if (this.activeId >= 3) {
          this.isbusinessSetup = true;
          this.isbusinessUserSetup = true;
        }
      }
    });
  }

  initControls() {
    this.initBusinessForm();
    this.initBusinessUserForm();

    this.businessPermissionForm = this.matbiaFormGroupService.initBusinessPermissions({
      businessHandle: '',
    });
  }

  initBusinessForm() {
    this.businessForm = this.matbiaFormGroupService.initBusinessRegister({
      businessType: '',
      naics: '',
      naicsCode: null,
      businessName: '',
      orgJewishName: '',
      address: '',
      city: '',
      state: null,
      zip: '',
      employerId: '',
      businessEmail: '',
      phone: '',
      officePhone: '',
      doingBusinessAs: '',
      businessWebsite: null,
      businessHandle: '',
    });

    const registerEmail = this.localStorageService.getLoginUserEmail();
    this.businessForm.patchValue({
      businessEmail: registerEmail,
    });

    this.businessForm.updateValueAndValidity();
    this.BusinessEmail?.disable();
    this.businessForm.updateValueAndValidity();
  }

  initBusinessUserForm() {
    this.businessUserForm = this.matbiaFormGroupService.initBusinessUser({
      firstName: '',
      lastName: '',
      address: '',
      apt: null,
      city: '',
      state: null,
      zip: '',
      email: '',
      phone: '',
      cellPhone: '',

      birthDate: null,
      ssn: '',
    });
  }

  goToCardSetup(event: Event) {
    event.preventDefault();
  }

  selectTab(value: number) {
    if (!this.isbusinessSetup) {
      return;
    }

    if (this.isbusinessSetup) {
      if (value === 1 || value === 2) {
        this.changeTab(value);
        return;
      }

      if (value >= 3 && this.isbusinessUserSetup) {
        this.changeTab(value);
        return;
      }

      return;
    }

    if (value > this.activeId) {
      return;
    }

    this.changeTab(value);
  }

  changeTab(value: number, params: any = {}) {
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: { activeStep: value, ...params },
      queryParamsHandling: 'merge',
    });
  }

  onBusinessRegister() {
    this.businessRegisterForm.setIsSubmitted();

    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      this.businessRegisterForm.triggerAnimation();
      return;
    }

    this.isLoading = true;
    this.businessAPI
      .register({
        ...this.businessForm.value,
        naicsCode: +this.businessForm.controls.naicsCode.value,
        businessEmail: this.BusinessEmail?.value,
      })
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.errors && response.errors.length > 0) {
            this.notification.showError(response.errors[0].error, 'Error!');
            return;
          }
          if (response.data.success) {
            this.isbusinessSetup = true;

            this.notification.showSuccess(
              `${this.businessForm.get('businessName')?.value} was successfully registered.`
            );

            this.businessPermissionForm.patchValue({
              businessHandle: response.userHandle,
            });

            this.onBusinessDetails({ businessName: this.businessForm.get('businessName')?.value, memberList: [] });

            this.changeTab(2, { businessHandle: response.userHandle });
          }
        },
        (error) => {
          this.isLoading = false;
          this.notification.showError(error.error, 'Error!');
        }
      );
  }

  onBusinessUser() {
    this.businessUserFormGroup.setIsSubmited();

    if (this.businessUserForm.invalid) {
      this.businessUserForm.markAllAsTouched();

      if (this.businessPermissionForm.get('businessHandle')?.invalid) {
        this.notification.showError('businessHandle missing', 'Error!');
      }

      return;
    }

    // reseting

    const data = this.businessUserForm?.value;
    const { birthDate, ...restValues } = data;
    this.isLoading = true;
    this.donorAPIService
      .register({
        ...restValues,
        birthDate: birthDate.startDate.format('YYYY-MM-DD'),
        businessHandle: this.businessPermissionForm.get('businessHandle')?.value,
      })
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.errors && response.errors.length > 0) {
            this.notification.showError(response.errors[0].error, 'Error!');
            return;
          }

          this.isbusinessUserSetup = true;

          this.businessUserForm.reset({
            firstName: '',
            lastName: '',
            address: '',
            apt: null,
            city: '',
            state: null,
            zip: '',
            email: '',
            phone: '',
            cellPhone: '',

            birthDate: null,
            ssn: '',
          });

          this.businessUserFormGroup.clearDateValue();
          this.businessUserForm.updateValueAndValidity();

          this.changeTab(3);
          this.notification.showSuccess(response.message);
        },
        (err) => {
          this.isLoading = false;
          this.notification.showError(err.error, 'Error!');
        }
      );
  }

  onBusinessPermission() {
    if (this.businessPermissionForm.invalid) {
      this.businessPermissionForm.markAllAsTouched();
      this.businessPermissionFormGroup.triggerAnimation();

      if (this.businessPermissionForm.get('businessHandle')?.invalid) {
        this.notification.showError('businessHandle missing', 'Error!');
      }
      return;
    }

    const data = this.businessPermissionFormGroup.getFinalValues();

    this.isLoading = true;
    this.businessLinkAPI.linkMembers(data).subscribe(
      (response) => {
        this.isLoading = false;

        const forAdmins = response.admins.filter((o) => {
          return o.errors && o.errors.length > 0;
        });

        const forCo = response.officers.filter((o) => {
          return o.errors && o.errors.length > 0;
        });

        const forBo = response.owners.filter((o) => {
          return o.errors && o.errors.length > 0;
        });

        if (forAdmins.length !== 0 || forCo.length !== 0 || forBo.length !== 0) {
          if (forAdmins.length !== 0) {
            this.notification.showError(forAdmins[0].errors[0].error, 'Error!');
          }

          if (forCo.length !== 0) {
            this.notification.showError(forCo[0].errors[0].error, 'Error!');
          }

          if (forBo.length !== 0) {
            this.notification.showError(forBo[0].errors[0].error, 'Error!');
          }

          return;
        }
        this.notification.showSuccess('Permission Added');
        this.refreshToken();
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error, 'Error!');
      }
    );
  }

  // After from authentication need to update user data
  refreshToken() {
    const accessToken = this.localStorageService.getLoginUserAccessToken();
    const refreshToken = this.localStorageService.getLoginUserRefreshToken();
    const loginUserID = this.localStorageService.getLoginUserId();

    const modelData: any = {
      accessToken,
      refreshToken,
      LoginUserID: loginUserID,
    };

    this.authService.refreshToken(modelData).subscribe(
      (data: any) => {
        this.localStorageService.setLoginUserDataAndToken(data);
        this.router.navigate([PageRouteVariable.DashboardUrl]);
      },
      (err) => {
        this.notification.showError(err.error, 'Error!');
      }
    );
  }

  onBusinessDetails(data: { businessName: string; memberList: Array<LinkedMember> }) {
    this.businessMemberList = data.memberList;
    this.businessName = data.businessName;
  }

  addNewMember() {
    this.changeTab(2);

    this.clearMemberForm();
    this.businessUserForm.enable();
    this.entityMemberLinkId = null;
    setTimeout(() => {
      this.businessUserFormGroup.doFocus();
    }, 250);
  }

  clearMemberForm() {
    this.businessUserForm.reset({
      firstName: '',
      lastName: '',
      address: '',
      apt: null,
      city: '',
      state: null,
      zip: '',
      email: '',
      phone: '',
      cellPhone: '',

      birthDate: null,
      ssn: '',
    });

    this.businessUserForm.updateValueAndValidity();
  }

  viewMember(member: LinkedMember) {
    this.changeTab(2);

    this.clearMemberForm();

    this.businessUserForm.disable();
    this.entityMemberLinkId = member.entityLinkMemberId;

    this.donorAPIService.get(member.memberHandle).subscribe((res) => {
      if (res) {
        this.businessUserForm.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          address: res.address,
          apt: res.apt,
          city: res.city,
          state: res.state || null,
          zip: res.zip,
          email: res.email,
          phone: res.phone,
          cellPhone: res.cellPhone,

          birthDate: res.birthDate ? { startDate: moment(res.birthDate), endDate: moment(res.birthDate) } : null,
          ssn: res.ssn,
        });
      }

      this.businessUserForm.updateValueAndValidity();
    });
  }

  onBusinessUserDelete() {
    if (!this.entityMemberLinkId) {
      return;
    }

    this.isLoading = true;

    this.businessLinkAPI.deleteMember(this.entityMemberLinkId).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          if (res.errors && res.errors.length !== 0) {
            this.notification.showError(res.errors[0].error);
            return;
          }
          this.notification.showSuccess(res.message || res.data.message);
          this.businessMemberList = this.businessMemberList.filter(
            (o) => o.entityLinkMemberId !== this.entityMemberLinkId
          );
          this.addNewMember();
        }
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error);
      }
    );
  }

  onBusinessCertifyDone() {
    this.refreshToken();
  }
}
