import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonDataService } from '@commons/common-data-service.service';

import { MatbiaFormGroupService } from '../matbia-form-group.service';
import { shakeTrigger } from '@commons/animations';
import {
  BusinessLinkMemberAPIService,
  LinkedMember,
  LinkMembersPayload,
} from '@services/API/business-link-member-api.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-add-business-permission-form-group',
  templateUrl: './add-business-permission-form-group.component.html',
  styleUrls: ['./add-business-permission-form-group.component.scss'],
  imports: [SharedModule],
  animations: [shakeTrigger],
})
export class AddBusinessPermissionFormGroupComponent implements OnInit, AfterContentInit {
  isUserLoading = false;
  isMembersLoading = false;

  inAnimation = false;

  usersEntity: Array<LinkedMember> = [];

  availableAdmins: Array<LinkedMember> = [];
  availableControllingOfficer: Array<LinkedMember> = [];
  availableBeneficialOwner: Array<LinkedMember> = [];

  @Input() formGroup!: UntypedFormGroup;

  @Output() fgSubmit = new EventEmitter();

  // Emit business details
  @Output() businessDetails = new EventEmitter();

  subscription!: Subscription;

  get Administrator() {
    return this.formGroup.get('admins');
  }

  get ControllingOfficer() {
    return this.formGroup.get('controllingOfficers');
  }

  get BeneficialOwnerList() {
    return this.formGroup.get('beneficial_owner_list');
  }

  get BeneficialOwners() {
    return this.formGroup.get('benificialOwners') as UntypedFormArray;
  }

  get BusinessHandle() {
    return this.formGroup.get('businessHandle');
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonDataService: CommonDataService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private businessLinkMemberAPI: BusinessLinkMemberAPIService
  ) {}

  ngOnInit(): void {
    this.formGroup.setValidators(this.ownershipStakeValidator());

    if (this.BusinessHandle?.value) {
      this.getLinkedMembers();
    }
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
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

  triggerRegister() {
    this.fgSubmit.emit();
  }

  /**
   * When any user select as a admin. Remove that user option from Controlling Officer and Beneficial Owner
   */
  onAdminChange() {
    this.refreshControllingOfficerList();
    this.refreshBeneficialOwnerList();
  }

  /**
   * When any user select as a Controlling Officer. Remove that user option from admin and Beneficial Owner
   */
  onControllingChange() {
    this.refreshAdminList();
    this.refreshBeneficialOwnerList();
  }

  /**
   * When any user select as a Beneficial Owner. Remove that user option from admin and Controlling Officer
   */
  onBeneficialChange() {
    this.refreshAdminList();
    this.refreshControllingOfficerList();
  }

  onAddBeneficial(data: LinkedMember) {
    this.BeneficialOwners.push(
      this.matbiaFormGroupService.addBeneficial({ handle: data.memberHandle, fullName: data.member, ownershipStake: 0 })
    );
  }

  onRemoveBeneficial(data: { value: LinkedMember }) {
    const index = (this.BeneficialOwners.value as Array<{ userHandle: string }>).findIndex((o) => {
      return o.userHandle === data.value.memberHandle;
    });
    this.BeneficialOwners.removeAt(index);
  }

  onRemoveAllBeneficial() {
    this.BeneficialOwners.clear();
  }

  canDisplay() {
    return this.BeneficialOwners.length > 1;
  }

  refreshAdminList() {
    this.availableAdmins = this.usersEntity;
  }

  refreshControllingOfficerList() {
    this.availableControllingOfficer = this.usersEntity;
  }

  refreshBeneficialOwnerList() {
    this.availableBeneficialOwner = this.usersEntity;
  }

  ownershipStakeValidator(): ValidatorFn {
    return (): { [key: string]: boolean } | null => {
      // if only have one BeneficialOwners then all ownership will be 100 and pass validation
      if (this.BeneficialOwners.value && this.BeneficialOwners.value.length === 1) {
        return null;
      }

      // if have more then one BeneficialOwners then count total ownershipStake
      if (this.BeneficialOwners.value && this.BeneficialOwners.value.length > 1) {
        const total = (this.BeneficialOwners.value as Array<{ userHandle: string; ownershipStake: number }>).reduce(
          (sumOf, o) => {
            const sum = o.ownershipStake ? o.ownershipStake : 0;
            return (sumOf = sumOf + sum);
          },
          0
        );
        if (total !== 100) {
          return { exceedsMax: true };
        }
        return null;
      }

      return null;
    };
  }

  getFinalValues(): LinkMembersPayload {
    const values = this.formGroup.value;
    if (this.canDisplay()) {
      return {
        ...values,
      };
    }
    return {
      ...values,
      benificialOwners: values.benificialOwners.map((o: { userHandle: string; ownershipStake: number }) => {
        return {
          ...o,
          ownershipStake: 100,
        };
      }),
    };
  }

  getLinkedMembers() {
    this.isMembersLoading = true;
    this.businessLinkMemberAPI.getAll(this.BusinessHandle?.value).subscribe((res) => {
      this.isMembersLoading = false;
      if (res) {
        // for only one user for one role

        const admins = res.filter((o) => o.roleName === 'administrator');
        const controllingOfficerList = res.filter((o) => o.roleName === 'controlling_officer');
        const beneficialOwnerList = res.filter((o) => o.roleName === 'beneficial_owner');

        this.formGroup.patchValue({
          admins: admins.map((o) => o.memberHandle),
          controllingOfficers: controllingOfficerList.map((o) => o.memberHandle),
          beneficial_owner_list: beneficialOwnerList.map((o) => o.memberHandle),
        });
        this.formGroup.updateValueAndValidity();

        this.BeneficialOwners.clear();
        this.formGroup.updateValueAndValidity();

        beneficialOwnerList.map((o) => {
          this.BeneficialOwners.push(
            this.matbiaFormGroupService.addBeneficial({
              handle: o.memberHandle,
              fullName: o.member,
              ownershipStake: o.ownershipStake || 0,
            })
          );
        });

        const uniqueList = this.listOfAllUser(res);
        this.usersEntity = uniqueList;

        this.businessDetails.emit({
          businessName: res[0].businessName,
          memberList: uniqueList,
        });

        this.formGroup.updateValueAndValidity();

        this.refreshAdminList();
        this.refreshControllingOfficerList();
        this.refreshBeneficialOwnerList();
      }
    });
  }

  listOfAllUser(res: Array<LinkedMember>) {
    const setOfArray: Array<LinkedMember> = [];

    for (const iterator of res) {
      const have = setOfArray.find((o) => {
        return o.memberHandle === iterator.memberHandle;
      });
      if (!have) {
        setOfArray.push(iterator);
      }
    }

    return setOfArray;
  }
}
