import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  DonationHistoryObj,
  DonorTransactionAPIService,
  GetOrgDonationHistoryPayload,
} from '@services/API/donor-transaction-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { DatePickerFilterComponent } from '@matbia/matbia-panel-shared/date-picker-filter/date-picker-filter.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-donation-history-popup',
  templateUrl: './donation-history-popup.component.html',
  styleUrls: ['./donation-history-popup.component.scss'],
  imports: [SharedModule, DatePickerFilterComponent, MatbiaSkeletonLoaderComponentComponent],
})
export class DonationHistoryPopupComponent implements OnInit {
  isLoading = false;

  @Input() organizationId: number | null = null;

  @Input() encryptedOrganizationId: string | null = '';

  @Input() campaignName = null;

  @Input() orgName: string | null = '';

  @Input() selectedDates: { fromDate: any; toDate: any } = {
    fromDate: '',
    toDate: '',
  };

  get isToirem() {
    return this.orgName && this.orgName.toLowerCase() === 'toirem';
  }

  orgDonationHistoryObj!: DonationHistoryObj;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    public activeModal: NgbActiveModal,
    private localStorageData: LocalStorageDataService,
    private donorTransactionAPI: DonorTransactionAPIService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData() {
    this.isLoading = true;
    const userHandle = this.localStorageData.getLoginUserUserName();

    const apiData: GetOrgDonationHistoryPayload = {
      userHandle: userHandle,
      ...this.selectedDates,
    };

    if (this.organizationId) {
      apiData.organizationId = this.organizationId;
    }

    if (this.encryptedOrganizationId) {
      apiData.encryptedOrgId = this.encryptedOrganizationId;
    }

    if (this.isToirem) {
      apiData.campaignName = this.campaignName;
    }

    this.donorTransactionAPI
      .getOrgDonationHistory({
        ...apiData,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (!res) {
            return;
          }

          this.orgDonationHistoryObj = res;
          this.changeDetectorRef.markForCheck();
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onSendDonation(event: Event) {
    event.preventDefault();

    this.closePopup();

    const url = [`/dashboard/donate`, this.orgDonationHistoryObj.orgEncryptedOrgId, 'donate'];

    const queryParams =
      this.orgDonationHistoryObj.organizationName === 'Toirem'
        ? { campaignName: this.orgDonationHistoryObj.campaignName, campaignId: this.orgDonationHistoryObj.campaignId }
        : {};

    this.router.navigate(url, {
      queryParams,
      state: {
        orgName: this.orgName,
        campaignname: this.campaignName,
      },
    });
  }

  filterChange(event: any) {
    this.selectedDates = event;
    this.loadData();
  }
}
