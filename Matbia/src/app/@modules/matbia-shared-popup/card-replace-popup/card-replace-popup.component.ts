import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { DonorAPIService, DonorGetResponse } from '@services/API/donor-api.service';
import { MatbiaCardAPIService } from '@services/API/matbia-card-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AnalyticsService } from '@services/analytics.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-card-replace-popup',
  templateUrl: './card-replace-popup.component.html',
  styleUrls: ['./card-replace-popup.component.scss'],
  imports: [SharedModule, DisplayLastPipe, ButtonLoaderComponent],
})
export class CardReplacePopupComponent implements OnInit {
  isLoading = false;

  isRequested = false;

  isRequesting = false;

  isDeactivationConfirm = false;

  isYes = false;

  // Card user
  @Input() userHandle!: string;

  // Card Id, for replace request
  @Input() cardIdForReplace!: string;

  // Card number, for display
  @Input() cardNumber!: string;

  cardOwnerDetails!: DonorGetResponse;

  constructor(
    private router: Router,
    public activeModal: NgbActiveModal,
    private localStorageService: LocalStorageDataService,
    private matbiaDonorAPI: DonorAPIService,
    private pageRoute: PageRouteVariable,
    private matbiaCardAPI: MatbiaCardAPIService,
    private notification: NotificationService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.getCardOwnerInfo();
  }

  onClose() {
    this.activeModal.close();
  }

  displayFullAddress() {
    if (this.cardOwnerDetails?.apt) {
      return `${this.cardOwnerDetails?.address || ''} ${this.cardOwnerDetails?.apt || ''}, ${
        this.cardOwnerDetails?.city || ''
      }, ${this.cardOwnerDetails?.state || ''}, ${this.cardOwnerDetails?.zip || ''}`;
    }

    return `${this.cardOwnerDetails?.address || ''}, ${this.cardOwnerDetails?.city || ''}, ${
      this.cardOwnerDetails?.state || ''
    }, ${this.cardOwnerDetails?.zip || ''}`;
  }

  private getCardOwnerInfo() {
    this.isLoading = true;
    this.matbiaDonorAPI.get(this.userHandle).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.cardOwnerDetails = res;
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onEdit() {
    this.onClose();
    this.router.navigate(this.pageRoute.getProfileRouterLink());
  }

  onConfirmDeactivation() {
    this.isDeactivationConfirm = true;
  }

  onReplace() {
    const modal = this.notification.initConfirmPopup();
    modal.then((res) => {
      if (res.isConfirmed) {
        this.replaceCardProcess();
      }
    });
  }

  onDontSendCard() {
    const modal = this.notification.initConfirmPopup();
    modal.then((res) => {
      if (res.isConfirmed) {
        this.doNotSendCardProcess();
      }
    });
  }

  private replaceCardProcess() {
    this.isRequesting = true;
    this.matbiaCardAPI
      .requestCard({
        fullName: `${this.cardOwnerDetails?.firstName} ${this.cardOwnerDetails?.lastName}`,
        apt: this.cardOwnerDetails?.apt,
        mailingAddress: this.cardOwnerDetails?.address,
        cityStateZip: `${this.cardOwnerDetails?.city}, ${this.cardOwnerDetails?.state}, ${this.cardOwnerDetails?.zip}`,
        phone: `${this.cardOwnerDetails?.phone}`,
        email: `${this.cardOwnerDetails?.email}`,
        replaceCardId: this.cardIdForReplace,
        entityID: this.localStorageService.getLoginUserId(),
      })
      .subscribe(
        () => {
          this.isRequesting = false;
          this.isRequested = true;
          this.isYes = true;

          this.analytics.initCardRequestEvent();
        },
        (err) => {
          this.isRequesting = false;
          this.notification.showError(err.error);
        }
      );
  }

  private doNotSendCardProcess() {
    this.isRequesting = true;
    this.matbiaCardAPI
      .requestCard({
        fullName: null,
        apt: null,
        mailingAddress: null,
        cityStateZip: null,
        phone: null,
        email: null,
        replaceCardId: this.cardIdForReplace,
        entityID: this.localStorageService.getLoginUserId(),
      })
      .subscribe(
        () => {
          this.isRequesting = false;
          this.isRequested = true;
          this.analytics.initCardRequestEvent();
        },
        (err) => {
          this.isRequesting = false;
          this.notification.showError(err.error);
        }
      );
  }
}
