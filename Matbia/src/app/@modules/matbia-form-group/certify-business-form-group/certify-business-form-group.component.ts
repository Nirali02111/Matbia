import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CommonDataService } from '@commons/common-data-service.service';
import { NotificationService } from '@commons/notification.service';
import { BusinessAPIService } from '@services/API/business-api.service';
import { BusinessLinkMemberAPIService, LinkedMember } from '@services/API/business-link-member-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-certify-business-form-group',
  templateUrl: './certify-business-form-group.component.html',
  styleUrls: ['./certify-business-form-group.component.scss'],
  imports: [SharedModule, ButtonLoaderComponent],
})
export class CertifyBusinessFormGroupComponent implements OnInit, AfterContentInit {
  isBusinessCertificationLoading = false;
  isLoading = false;
  isMembersLoading = false;

  certificationOn!: LinkedMember;

  availableAdmins: Array<LinkedMember> = [];
  availableBeneficialOwner: Array<LinkedMember> = [];
  certifyBeneficialOwner: Array<LinkedMember> = [];
  @Input() formGroup!: UntypedFormGroup;

  // Emit business details
  @Output() businessCertifyDone = new EventEmitter();

  get BusinessHandle() {
    return this.formGroup.get('businessHandle');
  }

  get isBusinessCertify() {
    return (
      this.availableBeneficialOwner.length === this.certifyBeneficialOwner.length &&
      this.availableBeneficialOwner.length !== 0
    );
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonDataService: CommonDataService,
    private businessLinkMemberAPI: BusinessLinkMemberAPIService,
    private businessAPI: BusinessAPIService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.BusinessHandle?.value) {
      this.getLinkedMembers();
    }
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  getLinkedMembers() {
    this.isMembersLoading = true;
    this.businessLinkMemberAPI.getAll(this.BusinessHandle?.value).subscribe((res) => {
      this.isMembersLoading = false;
      if (res) {
        this.availableAdmins = res.filter((o) => o.roleName === 'administrator');
        this.availableBeneficialOwner = res.filter((o) => o.roleName === 'beneficial_owner');
      }
    });
  }

  getFirstAdmin() {
    if (this.availableAdmins && this.availableAdmins.length !== 0) {
      return this.availableAdmins[0].memberHandle;
    }

    return '';
  }

  onCertifyBeneficialOwner(item: LinkedMember) {
    this.certificationOn = item;
    this.isLoading = true;
    this.businessAPI
      .certifyBeneficialOwner({
        adminUserHandle: this.getFirstAdmin(),
        businessHandle: this.BusinessHandle?.value,
        memberHandle: item.memberHandle,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;

          if (res.errors && res.errors.length > 0) {
            this.notification.showError(res.errors[0].error);
            return;
          }

          this.certifyBeneficialOwner.push(item);

          this.notification.showSuccess(res.message);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  onCertifyBusiness() {
    this.isBusinessCertificationLoading = true;
    this.businessAPI
      .certifyBusiness({
        adminUserHandle: this.getFirstAdmin(),
        businessHandle: this.BusinessHandle?.value,
      })
      .subscribe(
        (res) => {
          this.isBusinessCertificationLoading = false;

          if (res.errors && res.errors.length > 0) {
            this.notification.showError(res.errors[0].error);
            return;
          }

          this.notification.showSuccess(res.message);
          this.businessCertifyDone.emit(true);
        },
        () => {
          this.isBusinessCertificationLoading = false;
        }
      );
  }
}
