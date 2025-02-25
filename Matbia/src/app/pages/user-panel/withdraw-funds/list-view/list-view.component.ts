import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UntypedFormGroup } from '@angular/forms';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { OrganizationTransactionAPIService } from '@services/API/organization-transaction-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';

import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { RedeemFundsFormGroupComponent } from '@matbia/matbia-form-group/redeem-funds-form-group/redeem-funds-form-group.component';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule],
})
export class ListViewComponent implements OnInit, AfterContentInit, OnDestroy, AfterViewInit {
  isLoading = false;

  isAccountListLoading = false;

  redeemFormGroup!: UntypedFormGroup;

  @ViewChild(RedeemFundsFormGroupComponent) redeemFormGroupComponent!: RedeemFundsFormGroupComponent;

  constructor(
    protected title: Title,
    private router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private localStorageService: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private panelPopupService: PanelPopupsService,
    private orgTransactionAPI: OrganizationTransactionAPIService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private notification: NotificationService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Withdraw funds');

    this.redeemFormGroup = this.matbiaFormGroupService.initRedeemFundsFormGroup();

    const userHandle = this.localStorageService.getLoginUserUserName();

    this.redeemFormGroup.patchValue({
      handle: userHandle,
    });

    this.redeemFormGroup.updateValueAndValidity();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  openRedeemDonationPopup() {
    this.panelPopupService.openRedeemDonationPopup();
  }

  onRedeem() {
    if (this.redeemFormGroup.invalid) {
      this.redeemFormGroup.markAllAsTouched();

      return;
    }

    const modalRef = this.panelPopupService.openRedeemDonationConfirmPopup();

    const value = this.redeemFormGroup.value;
    let objValue = this.redeemFormGroupComponent.linkedAccountList.filter(
      (x) => x.bankAccountId == value.bankAccountId
    );
    modalRef.componentInstance.amount = +value.totalAmount;
    modalRef.componentInstance.accoNum = objValue && objValue[0].accountNumber;
    modalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (val) {
        this.doRedeemTemp();
      }
    });
  }

  private doRedeemTemp() {
    const values = this.redeemFormGroup.value;

    const apiData = {
      ...values,
      totalAmount: +values.totalAmount,
      createdBy: this.localStorageService.getLoginUserId(),
    };

    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
        return;
      }
    });

    this.orgTransactionAPI.redeemTemp(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res.error[0].error);
          return;
        }
        this.redeemFormGroupComponent.getBalance();
        this.notification.close();

        const modalRef = this.panelPopupService.openAfterRedeemDonationPopup();
        const value = this.redeemFormGroup.value;
        let objValue = this.redeemFormGroupComponent.linkedAccountList.filter(
          (x) => x.bankAccountId == value.bankAccountId
        );
        modalRef.componentInstance.accoNum = objValue && objValue[0].accountNumber;
        modalRef.componentInstance.amount = +value.totalAmount;
        this.redeemFormGroup.get('totalAmount')?.setValue(null);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  onSetUpAutomaticTransfer() {
    this.onAutomaticTransfer();
  }

  onAutomaticTransfer() {
    const modalRef = this.panelPopupService.openAutomaticTransfers();
    modalRef.componentInstance.amount = !this.redeemFormGroupComponent.isOnAutoRedeem
      ? +this.redeemFormGroupComponent.TotalAmount?.value
      : this.redeemFormGroupComponent.orgBalance.autoRedeemAmount;
    modalRef.componentInstance.availableToRedeem = this.redeemFormGroupComponent.orgBalance.availableToRedeem;

    modalRef.componentInstance.haveScheduleAutoRedeem = this.redeemFormGroupComponent.isAlreadyScheduleAutoRedeem;

    modalRef.componentInstance.isOnSchedule = this.redeemFormGroupComponent.isOnSchedule;
    modalRef.componentInstance.isOnAutoRedeem = this.redeemFormGroupComponent.isOnAutoRedeem;
    modalRef.componentInstance.selectedFrequency = this.redeemFormGroupComponent.orgBalance.recurrenceId;

    if (this.redeemFormGroupComponent.isOnSchedule) {
      if (this.redeemFormGroupComponent.autoTransferData.recurringPayment.frequency === 2) {
        modalRef.componentInstance.selectedDay = +moment(
          this.redeemFormGroupComponent.orgBalance.scheduleDateTime
        ).format('d');
      }

      if (this.redeemFormGroupComponent.autoTransferData.recurringPayment.frequency === 4) {
        modalRef.componentInstance.selectedDate =
          this.redeemFormGroupComponent.autoTransferData.recurringPayment.scheduleDate;
      }
    }

    modalRef.componentInstance.emtOnRedeemSchedule.subscribe((obj: any) => {
      this.redeemFormGroupComponent.autoTransferData = {
        recurringPayment: {
          ...obj,
        },
      };
      this.doScheduleRedeem({
        recurringPayment: {
          ...obj,
        },
        bankAccountId: this.redeemFormGroupComponent.BankAccountId?.value,
      });
    });
  }

  private doScheduleRedeem(apiData: any) {
    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
        return;
      }
    });

    this.orgTransactionAPI.scheduleRedeem(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res.error[0].error);
          return;
        }

        this.notification.displaySuccess(res);
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  onRelink() {
    this.relinkPopup();
  }

  private relinkPopup() {
    this.panelPopupService.open(this.redeemFormGroupComponent.relinkContentModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'relink--popup',
      size: 'md',
      scrollable: true,
    });
  }

  onRelinkClick(modal: NgbModalRef) {
    modal.close();
  }
}
