import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { AddFundsFromBankComponent } from '@matbia/matbia-form-group/add-funds-from-bank/add-funds-from-bank.component';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { DonationRequestAPIService } from '@services/API/donation-request-api.service';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { DonationRequestObj } from 'src/app/models/panels';
import { PanelPopupsService } from '../../popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss'],
  imports: [SharedModule, AddFundsFromBankComponent],
})
export class RequestDetailComponent implements OnInit {
  requestsCount = 0;
  orgId!: string;
  requestId!: number;
  matbiaAddFundForm!: UntypedFormGroup;
  requestData!: DonationRequestObj;

  @ViewChild(AddFundsFromBankComponent, { static: false }) matbiaAddFundFormGroup!: AddFundsFromBankComponent;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private pageRoute: PageRouteVariable,
    private notification: NotificationService,
    private localStorage: LocalStorageDataService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private popupService: PanelPopupsService,
    private donorTransactionAPI: DonorTransactionAPIService,
    private donationRequestAPI: DonationRequestAPIService
  ) {}

  ngOnInit(): void {
    const username = this.localStorage.getLoginUserUserName();
    this.localStorage.requestCount.subscribe(() => {
      this.requestsCount = this.localStorage.requestsCount;
    });
    this.requestsCount = this.localStorage.requestsCount;
    this.activeRoute.paramMap.subscribe((param) => {
      const orgId = param.get('orgId');
      if (orgId) {
        this.orgId = orgId;
      }

      const reqId = param.get('reqId');
      if (reqId) {
        this.requestId = +reqId;
        this.getRequestData();
      }
    });

    this.matbiaAddFundForm = this.matbiaFormGroupService.initAddFundFormGroup({
      isRecurring: false,
      isDonate: true,
      userHandle: username,
      amount: null,
      bankAccountId: null,
      transDate: '',
      transferNowAmount: null,
      isNotifyOnEmail: true,
      isNotifyOnSMS: false,
      recurringPayment: {
        count: null,
        amount: null,
        frequency: null,
        scheduleDate: null,
      },
    });
  }

  getRequestData() {
    this.donationRequestAPI.getRequest(this.requestId).subscribe((res) => {
      if (res) {
        this.requestData = res;
        this.matbiaAddFundForm.patchValue({ amount: res.amount });
      }
    });
  }

  getRequestsRouterLink() {
    return this.pageRoute.getRequestsRouterLink();
  }

  onDonateFunds() {
    if (this.matbiaAddFundForm.invalid) {
      this.matbiaAddFundForm.markAllAsTouched();
      return;
    }

    const value = this.matbiaAddFundFormGroup.finalDonationValues();
    const userId = this.localStorage.getLoginUserId();

    const apidata = {
      ...value,
      createdBy: userId || 0,
      donationRequestId: this.requestId,
    };

    const confModalRef = this.matbiaAddFundFormGroup.openConfirmation();
    confModalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (!val) {
        return;
      }
      this.doDonation(apidata);
    });
  }

  private doDonation(apiData: any) {
    this.notification.initLoadingPopup();
    this.donorTransactionAPI.donate(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.close();

        const modalRef = this.popupService.openAfterDonationPopup();
        modalRef.componentInstance.amount = apiData.amount;
        modalRef.componentInstance.organization = this.matbiaAddFundFormGroup.displayOrgDetails();

        modalRef.componentInstance.isInsidePanel = false;

        modalRef.dismissed.subscribe(() => {
          this.router.navigate(this.pageRoute.getRequestsRouterLink());
        });
        const requestCount = this.requestsCount - 1;
        this.localStorage.setReuestsCount(requestCount);

        if (this.matbiaAddFundFormGroup.Recurring?.value) {
          modalRef.componentInstance.isRecurring = this.matbiaAddFundFormGroup.Recurring?.value;
          modalRef.componentInstance.totalAmount = this.matbiaAddFundFormGroup.recurringComponent.displayTotal();

          modalRef.componentInstance.frequency =
            this.matbiaAddFundFormGroup.recurringComponent.transactionRecurrences.find(
              (o) => o.id === apiData.recurringPayment?.frequency
            )?.name;

          if (apiData.recurringPayment?.count !== -1) {
            modalRef.componentInstance.startDate = this.matbiaAddFundFormGroup.recurringComponent.previewList[0].date;
            modalRef.componentInstance.endDate = this.matbiaAddFundFormGroup.recurringComponent.previewListLast[0].date;
          }

          if (apiData.recurringPayment?.count === -1) {
            modalRef.componentInstance.startDate = this.matbiaAddFundFormGroup.recurringComponent.previewList[0].date;
            modalRef.componentInstance.endDate = null;
            modalRef.componentInstance.totalAmount = apiData.amount;
          }

          modalRef.componentInstance.count = apiData.recurringPayment?.count;
        }

        if (!res.gatewayResponse) {
          modalRef.componentInstance.isError = true;
          modalRef.componentInstance.errorMessage = res.status;
          return;
        }

        if (res.gatewayResponse?.errors.length !== 0) {
          modalRef.componentInstance.isError = true;
          modalRef.componentInstance.errorMessage = res.gatewayResponse?.errors[0].error;
          return;
        }

        if (res.error && res.error.length !== 0) {
          modalRef.componentInstance.isError = true;
          modalRef.componentInstance.errorMessage = res?.error[0].error;
          return;
        }
      },
      (err) => {
        this.notification.hideLoader();
        this.notification.close();

        const modalRef = this.popupService.openAfterDonationPopup();
        modalRef.componentInstance.amount = apiData.amount;
        modalRef.componentInstance.organization = this.matbiaAddFundFormGroup.displayOrgDetails();
        modalRef.componentInstance.isError = true;

        if (err.error === 'Insufficient wallet balance') {
          modalRef.componentInstance.errorMessage = 'Insufficient funds';
          return;
        }
        modalRef.componentInstance.errorMessage = err.error;
      }
    );
  }
}
