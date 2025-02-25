import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PanelPopupsService } from '../../../popups/panel-popups.service';
import { IntegratingAccountPopupComponent } from '../integrating-account-popup/integrating-account-popup.component';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationAPIService } from '@services/API/organization-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { APIKeyComponent } from '@matbia/matbia-directive/components/apikey/apikey.component';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-use-api-key-popup',
  templateUrl: './use-api-key-popup.component.html',
  styleUrls: ['./use-api-key-popup.component.scss'],
  imports: [SharedModule, APIKeyComponent],
})
export class UseApiKeyPopupComponent implements OnInit {
  businessForm!: UntypedFormGroup;

  get OrgHandle() {
    return this.businessForm?.get('orgHandle');
  }

  @ViewChild(APIKeyComponent, { static: false }) apiKeyComponent!: APIKeyComponent;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private localStorage: LocalStorageDataService,
    private popupService: PanelPopupsService,
    private organizationAPI: OrganizationAPIService
  ) {}

  ngOnInit(): void {
    this.businessForm = this.fb.group({
      orgHandle: this.fb.control(null, Validators.compose([Validators.required])),
    });
    this.getOrganizationDetails();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  clickIntegratingAccount() {
    this.closePopup();
    this.openAccountPopup();
  }

  getOrganizationDetails() {
    const businessHandle = this.localStorage.getLoginUserUserName();
    this.organizationAPI.getOrganizationByUsername(businessHandle).subscribe(
      (res) => {
        if (res) {
          this.businessForm.patchValue({
            orgHandle: res.orgHandle,
          });
          this.businessForm.updateValueAndValidity();
        }
      },
      () => {}
    );
  }

  private openAccountPopup(accountNum = null) {
    const modalRef = this.popupService.open(IntegratingAccountPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-integration',
      size: 'lg',
      scrollable: true,
    });

    modalRef.componentInstance.accountNum = accountNum;
    modalRef.componentInstance.reOpen.subscribe((obj: any) => {
      this.openAccountPopup(obj.accountNum);
    });
  }
}
