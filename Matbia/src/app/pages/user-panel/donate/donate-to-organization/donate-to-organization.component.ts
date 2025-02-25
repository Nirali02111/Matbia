import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { AddFundsFromBankComponent } from '@matbia/matbia-form-group/add-funds-from-bank/add-funds-from-bank.component';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { RecurringFormGroupComponent } from '@matbia/matbia-form-group/recurring-form-group/recurring-form-group.component';

import { FavoriteOrgObj, OrganizationAPIService, OrgObj } from '@services/API/organization-api.service';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { DonateObserverService } from '../donate-observer.service';

import { MatbiaObserverService } from '@commons/matbia-observer.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-donate-to-organization',
  templateUrl: './donate-to-organization.component.html',
  styleUrls: ['./donate-to-organization.component.scss'],
  imports: [SharedModule, AddFundsFromBankComponent],
})
export class DonateToOrganizationComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: no-inferrable-types
  isLoading: boolean = false;

  isDevEnv = false;

  matbiaAddFundForm!: UntypedFormGroup;
  orgId!: string;
  campaignName = signal<string | null>(null);
  campaignID = signal<any | null>(null);
  private isHaveDonateSearch = false;
  private _matbiaDonateSearchSubscriptions: Subscription = new Subscription();
  @ViewChild(AddFundsFromBankComponent, { static: false }) matbiaAddFundFormGroup!: AddFundsFromBankComponent;

  @ViewChild(RecurringFormGroupComponent, { static: false }) recurringComponent!: RecurringFormGroupComponent;
  organization!: OrgObj;

  get displayName(): string {
    return this.localStorage.getLoginUserFullName() || '';
  }

  get displayBusinessName(): string {
    return this.localStorage.getLoginUserBusinessName() || '';
  }
  orgName: any;
  CampaignName: any;

  constructor(
    private activeRoute: ActivatedRoute,
    private localStorage: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private donorTransactionAPI: DonorTransactionAPIService,
    private notification: NotificationService,
    private popupService: PanelPopupsService,
    public donateObserver: DonateObserverService<OrgObj, FavoriteOrgObj>,
    private panelPopupService: PanelPopupsService,
    private matbiaObserver: MatbiaObserverService,
    private organizationAPI: OrganizationAPIService
  ) {}

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  onBackClick() {
    if (this.isHaveDonateSearch) {
      this.donateObserver.ReturningBack = true;
    }
  }

  ngOnInit(): void {
    const username = this.localStorage.getLoginUserUserName();

    this.activeRoute.paramMap.subscribe((param) => {
      const id = param.get('id');
      if (id) {
        this.orgId = id;
        this.getOrganizationDetails();
      }
    });

    const state = history.state;
    if (state) {
      this.orgName = state.orgName;
      this.CampaignName = state.campaignname;
    }
    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    this.matbiaAddFundForm = this.matbiaFormGroupService.initAddFundFormGroup({
      isRecurring: false,
      isDonate: true,
      note: '',
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
    this.activeRoute.queryParamMap.subscribe((param) => {
      const refNum = param.get('refNum');

      if (refNum) {
        this.matbiaAddFundForm.patchValue({
          note: `Donation due to transaction ID ${refNum} decline.`,
        });
      }
    });
    this._matbiaDonateSearchSubscriptions = this.donateObserver.rows$.subscribe((result) => {
      if (result.lastSearch) {
        this.isHaveDonateSearch = true;
      }
    });
    this.activeRoute.queryParamMap.subscribe((param) => {
      const v = param.get('campaignName');

      const id = param.get('campaignId');
      if (id) {
        this.campaignID.set(id);
      }
      if (v) {
        this.campaignName.set(v);
      }
    });
  }

  ngOnDestroy(): void {
    this._matbiaDonateSearchSubscriptions.unsubscribe();
  }

  onDonateFunds() {
    if (this.matbiaAddFundForm.invalid) {
      this.matbiaAddFundForm.markAllAsTouched();
      return;
    }

    const value = this.matbiaAddFundFormGroup.finalDonationValues();
    const userId = this.localStorage.getLoginUserId();
    const apiData = {
      ...value,
      createdBy: userId || 0,
      campaignId: this.campaignID(),
    };

    const confModalRef = this.matbiaAddFundFormGroup.openConfirmation();
    confModalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (!val) {
        return;
      }
      this.executeDonation(apiData);
    });
  }

  private executeDonation(apiData: any) {
    this.notification.initLoadingPopup();
    this.donorTransactionAPI.donate(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.close();

        const modalRef = this.popupService.openAfterDonationPopup();
        modalRef.componentInstance.amount = apiData.amount;
        modalRef.componentInstance.organization = this.matbiaAddFundFormGroup.displayOrgDetails();

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

  private getReportMissingAndThankYouPopup() {
    return this.popupService.openReportMissingOrganization();
  }

  private openThankYouMissingPopup(organizationName: string) {
    const modalRef = this.getReportMissingAndThankYouPopup();

    modalRef.componentInstance.isThankYou = true;
    modalRef.componentInstance.reportedOrganizationName = organizationName;

    modalRef.componentInstance.refresh.subscribe(() => {});
  }

  onOrgSuggestionClicked(orgId: string) {
    const modalRef = this.getReportMissingAndThankYouPopup();

    modalRef.componentInstance.orgId = orgId;

    modalRef.componentInstance.isSuggestion = true;

    modalRef.componentInstance.openThankYouModal.subscribe((organizationName: string) => {
      this.openThankYouMissingPopup(organizationName);
    });
  }

  openDonationHistoryPopup() {
    const modalRef = this.panelPopupService.openDonationHistoryPopup();
    modalRef.componentInstance.orgName = this.orgName;
    modalRef.componentInstance.campaignName = this.CampaignName;
    modalRef.componentInstance.encryptedOrganizationId = this.matbiaAddFundFormGroup.organization.orgEncryptedOrgId;
  }

  getOrganizationDetails() {
    this.organizationAPI.getOrganizationById(this.orgId).subscribe(
      (res: OrgObj) => {
        if (res) {
          this.organization = res;
        }
      },
      () => {}
    );
  }
}
