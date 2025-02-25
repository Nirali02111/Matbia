import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { merge, Subject } from 'rxjs';
import moment from 'moment';

import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { OrganizationAPIService } from '@services/API/organization-api.service';

import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { BusinessUserFormGroupComponent } from '@matbia/matbia-form-group/business-user-form-group/business-user-form-group.component';
import { BusinessRegisterFormGroupComponent } from '@matbia/matbia-form-group/business-register-form-group/business-register-form-group.component';
import { AddBusinessPermissionFormGroupComponent } from '@matbia/matbia-form-group/add-business-permission-form-group/add-business-permission-form-group.component';

import { NgxPlaidLinkService } from '@services/ngx-plaid-link.service';
import { BusinessAPIService } from '@services/API/business-api.service';
import { BusinessLinkMemberAPIService, LinkedMember } from '@services/API/business-link-member-api.service';
import { DonorAPIService } from '@services/API/donor-api.service';
import { Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule, AddBusinessPermissionFormGroupComponent, ButtonLoaderComponent],
  providers: [NgxPlaidLinkService],
})
export class ListViewComponent implements OnInit, AfterViewInit, AfterContentInit {
  @ViewChild('businessRegisterForm') businessRegisterForm!: BusinessRegisterFormGroupComponent;
  @ViewChild('businessUserFormGroup') businessUserFormGroup!: BusinessUserFormGroupComponent;
  @ViewChild('businessPermissionFormGroup') businessPermissionFormGroup!: AddBusinessPermissionFormGroupComponent;

  private initialize$ = new Subject<boolean>();

  businessName!: string;
  businessMemberList!: Array<LinkedMember>;

  entityMemberLinkId!: number | null;
  isbusinessSetup = false;
  isbusinessUserSetup = false;

  isLoading = false;
  activeId = 1;

  businessForm!: UntypedFormGroup;

  businessUserForm!: UntypedFormGroup;

  businessPermissionForm!: UntypedFormGroup;

  constructor(
    protected title: Title,
    private fb: UntypedFormBuilder,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,

    private businessAPI: BusinessAPIService,
    private businessLinkAPI: BusinessLinkMemberAPIService,

    private organizationAPI: OrganizationAPIService,

    private matbiaFormGroupService: MatbiaFormGroupService,
    private notification: NotificationService,
    private donorAPIService: DonorAPIService,

    private localStorage: LocalStorageDataService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Accounts');
    this.initControls();
    this.getOrganizationDetails();
    this.getMemberList();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    merge(this.businessRegisterForm.naicInit, this.initialize$.asObservable()).subscribe(() => {
      this.businessRegisterForm.setNAIC();
    });
  }

  initControls() {
    this.initBusinessForm();
    this.initBusinessUserForm();
    const businessHandle = this.localStorage.getLoginUserUserName();

    this.businessPermissionForm = this.matbiaFormGroupService.initBusinessPermissions({
      businessHandle,
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
    });

    this.businessForm.addControl('orgHandle', this.fb.control('', Validators.compose([Validators.required])));
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

  selectTab(value: number) {
    if (this.activeId === value) {
      return;
    }

    this.activeId = value;

    this.clearMemberForm();

    if (this.activeId === 1) {
      this.getOrganizationDetails();
    }

    if (this.activeId === 2) {
      this.businessUserForm.enable();
      setTimeout(() => {
        this.businessUserFormGroup.doFocus();
      }, 250);
    }
  }

  // Get Details

  getOrganizationDetails() {
    const businessHandle = this.localStorage.getLoginUserUserName();

    this.organizationAPI.getOrganizationByUsername(businessHandle).subscribe((res) => {
      if (res) {
        this.businessName = res.businessName;

        this.businessForm.patchValue({
          businessType: res.businessType,

          naicsCode: res.naicsCode,
          businessName: res.businessName,
          doingBusinessAs: res.doingBusinessAs,
          businessWebsite: res.businessWebsite,

          address: res.address,
          city: res.city,
          state: res.state,
          zip: res.zip,
          employerId: res.employerId,
          businessEmail: res.email,
          phone: res.phone,

          orgHandle: res.orgHandle,
        });

        this.businessForm.updateValueAndValidity();
        this.initialize$.next(true);
      }
    });
  }

  // Get LinkMember
  getMemberList() {
    const businessHandle = this.localStorage.getLoginUserUserName();

    this.businessLinkAPI.getAll(businessHandle).subscribe(
      (res) => {
        const setOfArray: Array<LinkedMember> = [];

        for (const iterator of res) {
          const have = setOfArray.find((o) => {
            return o.memberHandle === iterator.memberHandle;
          });
          if (!have) {
            setOfArray.push(iterator);
          }
        }

        this.businessMemberList = setOfArray;
      },
      () => {}
    );
  }

  addNewMember() {
    this.activeId = 2;
    this.clearMemberForm();
    this.businessUserForm.enable();
    this.entityMemberLinkId = null;
    setTimeout(() => {
      this.businessUserFormGroup.doFocus();
    }, 250);
  }

  viewMember(member: LinkedMember) {
    this.activeId = 2;
    this.entityMemberLinkId = member.entityLinkMemberId;
    this.clearMemberForm();

    this.businessUserForm.disable();

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

  onBusinessUpdate() {
    this.businessRegisterForm.setIsSubmitted();

    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      this.businessRegisterForm.triggerAnimation();
      return;
    }

    this.isLoading = true;
    this.businessAPI
      .update({
        ...this.businessForm.value,
        naicsCode: +this.businessForm.get('naicsCode')?.value,
      })
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.errors && response.errors.length > 0) {
            this.notification.showError(response.errors[0].error, 'Error!');
            return;
          }

          if (response.success) {
            this.isbusinessSetup = true;
            this.notification.showSuccess(response.message);
            this.selectTab(2);
          }
        },
        (error) => {
          this.isLoading = false;
          this.notification.showError(error.error, 'Error!');
        }
      );
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

          this.clearMemberForm();

          this.selectTab(3);
          this.notification.showSuccess(response.message);
        },
        (err) => {
          this.isLoading = false;
          this.notification.showError(err.error, 'Error!');
        }
      );
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
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error, 'Error!');
      }
    );
  }

  onBusinessPermissionDetails(data: { businessName: string; memberList: Array<LinkedMember> }) {
    this.businessMemberList = data.memberList;
    this.businessName = data.businessName;
  }
}
