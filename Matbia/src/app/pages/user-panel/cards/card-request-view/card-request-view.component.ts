import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { DonorAPIService, DonorGetResponse } from '@services/API/donor-api.service';
import { MatbiaCardAPIService } from '@services/API/matbia-card-api.service';

import { PanelPopupsService } from '../../popups/panel-popups.service';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { AnalyticsService } from '@services/analytics.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { SendMeCardFormGroupComponent } from '@matbia/matbia-form-group/send-me-card-form-group/send-me-card-form-group.component';

@Component({
  selector: 'app-card-request-view',
  templateUrl: './card-request-view.component.html',
  styleUrls: ['./card-request-view.component.scss'],
  imports: [SharedModule, SendMeCardFormGroupComponent],
})
export class CardRequestViewComponent implements OnInit, AfterContentInit, AfterViewInit {
  isLoading = false;
  isCardRequested = false;

  donorData!: DonorGetResponse;
  requestCardForm!: UntypedFormGroup;

  constructor(
    private router: Router,
    protected title: Title,
    private pageRoute: PageRouteVariable,
    private panelPopup: PanelPopupsService,
    private localStorageService: LocalStorageDataService,
    private donorAPI: DonorAPIService,
    private matbiaCardAPI: MatbiaCardAPIService,
    private matbiaFormGroup: MatbiaFormGroupService,
    private analytics: AnalyticsService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Send Me card');

    this.requestCardForm = this.matbiaFormGroup.initSendMeCardFormGroup();

    this.getDonorData();
  }

  ngAfterContentInit(): void {}

  ngAfterViewInit(): void {}

  getAddAdditionalCardRouterLink() {
    return this.pageRoute.getAddAdditionalCardRouterLink();
  }

  getDonorData() {
    this.isLoading = true;
    const username = this.localStorageService.getLoginUserUserName();
    this.donorAPI.get(username).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.donorData = res;
          this.requestCardForm.patchValue({
            fullName: `${res.firstName} ${res.lastName}`,
            mailingAddress: res.address,
            apt: res.apt,
            cityStateZip: `${res.city} ${res.state} ${res.zip}`,
            email: res.email,
            phone: res.phone,
          });

          this.requestCardForm.updateValueAndValidity();
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  openEditPopup() {
    const modalRef = this.panelPopup.openEditAddressPopup();

    modalRef.componentInstance.donorData = this.donorData;

    modalRef.componentInstance.savedAddress.subscribe((data: any) => {
      if (data) {
        this.donorData.firstName = data.firstName;
        this.donorData.lastName = data.lastName;
        this.donorData.address = data.mailingAddress;
        this.donorData.city = data.city;
        this.donorData.state = data.state;
        this.donorData.zip = data.zip;
        this.donorData.apt = data.apt;

        this.requestCardForm.patchValue({
          fullName: `${data.firstName} ${data.lastName}`,
          mailingAddress: data.mailingAddress,
          cityStateZip: `${data.city} ${data.state} ${data.zip}`,
          apt: data.apt,
        });

        this.requestCardForm.updateValueAndValidity();
      }
    });
  }

  onRequest() {
    this.isLoading = true;

    this.matbiaCardAPI
      .requestCard({
        ...this.requestCardForm.value,
        entityID: this.localStorageService.getLoginUserId(),
      })
      .subscribe(
        (res) => {
          if (res) {
            this.isLoading = false;
            const url = [`/${PageRouteVariable.SendMeCardUrl}`];
            this.router.navigate(url, {
              state: {
                isCardRequested: 'true',
              },
            });
            this.analytics.initCardRequestEvent();
          }
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  requestDone() {
    const modalRef = this.panelPopup.openCardRequestPopup();
    modalRef.componentInstance.isRequested = true;

    modalRef.closed.subscribe(() => {
      this.router.navigate([PageRouteVariable.DashboardUrl]);
    });
  }
}
