import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { DonorAPIService, DonorGetResponse } from '@services/API/donor-api.service';
import { MatbiaCardAPIService } from '@services/API/matbia-card-api.service';

import { EditAddressPopupComponent } from '@matbia/matbia-shared-popup/edit-address-popup/edit-address-popup.component';
import { ActivateCardPopupComponent } from '../activate-card-popup/activate-card-popup.component';
import { AnalyticsService } from '@services/analytics.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-send-card',
  templateUrl: './send-card.component.html',
  styleUrls: ['./send-card.component.scss'],
  imports: [SharedModule, ButtonLoaderComponent],
})
export class SendCardComponent implements OnInit, AfterContentInit, AfterViewInit {
  isLoading = false;
  isCardRequested = false;

  donorData!: DonorGetResponse;
  requestCardForm!: UntypedFormGroup;
  toShowCloseButton: boolean = false;
  showContinueButton: boolean = false;

  get Name() {
    return this.requestCardForm.get('fullName');
  }

  get Address() {
    return this.requestCardForm.get('mailingAddress');
  }

  get Apt() {
    return this.requestCardForm.get('apt');
  }

  get CityStateZip() {
    return this.requestCardForm.get('cityStateZip');
  }

  get DisplayAddress() {
    if (this.Apt?.value) {
      return `${this.Address?.value} ${this.Apt.value} ${this.CityStateZip?.value}`;
    }

    return `${this.Address?.value} ${this.CityStateZip?.value}`;
  }

  constructor(
    private router: Router,
    protected title: Title,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private localStorageService: LocalStorageDataService,
    private donorAPI: DonorAPIService,
    private matbiaCardAPI: MatbiaCardAPIService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    const state = history.state;

    if (state && state.isCardRequested) {
      this.isCardRequested = true;
      this.toShowCloseButton = true;
    }
    if (state && state.isCardSettingsSaved === false) {
      this.showContinueButton = true;
    }
    this.title.setTitle('Matbia - Send Me card');

    this.initControls();

    this.getDonorData();
  }

  private initControls() {
    this.requestCardForm = this.fb.group({
      fullName: this.fb.control('', Validators.compose([Validators.required])),
      mailingAddress: this.fb.control('', Validators.compose([Validators.required])),
      apt: this.fb.control('', Validators.compose([])),
      cityStateZip: this.fb.control('', Validators.compose([Validators.required])),
      phone: this.fb.control('', Validators.compose([])),
    });
  }

  ngAfterContentInit(): void {}

  ngAfterViewInit(): void {}

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

  open() {
    const modalRef = this.modalService.open(EditAddressPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'edit-your-address-popup',
    });
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
    if (this.requestCardForm.invalid) {
      this.requestCardForm.markAllAsTouched();
      return;
    }

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
            this.isCardRequested = true;
            this.analytics.initCardRequestEvent();
          }
        },
        () => {
          this.isLoading = false;
          this.isCardRequested = true;
        }
      );
  }

  onActivateCard(event: any) {
    event.preventDefault();
    this.openActivateCard();
  }

  openActivateCard() {
    const modalRef = this.modalService.open(ActivateCardPopupComponent, {
      centered: true,
      keyboard: false,
      windowClass: 'active-card-pop',
    });

    const userData = this.localStorageService.getLoginUserData();

    if (!userData?.isCardSettingsSaved) {
      modalRef.componentInstance.isFromSendMeCard = true;
    }
  }

  proceedToPortal() {
    this.router.navigate([PageRouteVariable.DashboardUrl]);
  }

  getCardsRouterLink() {
    return this.router.navigate([`/${PageRouteVariable.DashboardUrl}/${PageRouteVariable.CardsUrl}`]);
  }

  ActivateCard() {
    this.router.navigate([`/${PageRouteVariable.ActivateCard}`]);
  }

  continue() {
    const queryParams = {
      userHandle: this.localStorageService.getLoginUserUserName(),
    };

    this.router.navigate([`/setup-card-setting`], {
      queryParams: { ...queryParams, activeStep: 2 },
      queryParamsHandling: 'merge',
    });
  }
}
