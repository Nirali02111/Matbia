import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { shakeTrigger } from '@commons/animations';
import { PageRouteVariable } from '@commons/page-route-variable';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { MatbiaCardFormGroupComponent } from '@matbia/matbia-form-group/matbia-card-form-group/matbia-card-form-group.component';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { MatbiaCardObj, MatbiaCardSettingService } from '@services/API/matbia-card-setting.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  imports: [SharedModule, DisplayLastPipe, MatbiaCardFormGroupComponent, ButtonLoaderComponent],
  animations: [shakeTrigger],
})
export class CardDetailComponent implements OnInit {
  isLoading = false;
  isAnimate = false;

  matbiaCardSubmitButton = false;

  cardNumber = '';

  cardSettingData!: MatbiaCardObj;

  @ViewChild(MatbiaCardFormGroupComponent) matbiaCardForm!: MatbiaCardFormGroupComponent;

  matbiaCardDetailForm!: UntypedFormGroup;
  isEndWithnine: boolean = false;

  get CVV() {
    return this.matbiaCardDetailForm.get('cvv');
  }

  constructor(
    private title: Title,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private pageRoute: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private panelPopupService: PanelPopupsService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private matbiaCardSettingAPI: MatbiaCardSettingService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Card settings');
    this.matbiaCardDetailForm = this.matbiaFormGroupService.initMatbiaCardFormGroup({
      cardId: '',
      nameOnCard: '',
      cardNumber: '',
      cardExp: '',
      cvv: '',
      phoneNum: '',

      statusID: 0,

      corner1: '',
      corner2: '',
      corner3: '',
      corner4: '',
      pin: '',
    });

    this.activeRouter.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.getCardDetails(id);
      }
    });
  }

  getCardsRouterLink() {
    return this.pageRoute.getCardsRouterLink();
  }

  onMatbiaCardNextCorner() {
    this.matbiaCardForm.nextCorner();
  }

  canMatbiaCardSetup(data: boolean) {
    this.matbiaCardSubmitButton = data;
  }

  isCardLock() {
    return this.matbiaCardDetailForm.get('statusID')?.value === 3;
  }

  /**
   * Only for Adding new card
   *
   * for new card all corner and pin value is null
   * Check if all four corner value and pin is set then allow to back
   *
   * @returns Boolean
   */
  isAllowToBack() {
    return (
      !!this.cardSettingData?.corner1 &&
      !!this.cardSettingData?.corner2 &&
      !!this.cardSettingData?.corner3 &&
      !!this.cardSettingData?.corner4 &&
      !!this.cardSettingData?.pin
    );
  }

  getCardDetails(cardId: string) {
    this.isLoading = true;

    const userHandle = this.localStorage.getLoginUserUserName();

    this.matbiaCardSettingAPI.GetSetting(userHandle, cardId).subscribe(
      (res) => {
        this.isLoading = false;
        if (res && res.length !== 0) {
          this.cardSettingData = res[0];
          this.cardNumber = this.cardSettingData.cardNum;

          this.matbiaCardDetailForm.patchValue({
            nameOnCard: this.cardSettingData.cardHolderName,
            cardNumber: this.cardSettingData.cardNum,
            cardId: this.cardSettingData.cardId,
            cardExp: this.cardSettingData.expiry,
            corner1: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner1),
            corner2: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner2),
            corner3: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner3),
            corner4: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner4),
            cvv: this.cardSettingData.pin,
            phoneNum: this.cardSettingData.phoneNum ? this.cardSettingData.phoneNum : '',

            statusID: this.cardSettingData.statusID || 0,
          });

          this.matbiaCardDetailForm.get('cardNumber')?.disable();

          this.matbiaCardDetailForm.get('cardExp')?.disable();

          this.matbiaCardDetailForm.updateValueAndValidity();

          if (
            this.matbiaCardForm.FirstCorner?.valid &&
            this.matbiaCardForm.SecondCorner?.valid &&
            this.matbiaCardForm.ThirdCorner?.valid &&
            this.matbiaCardForm.FourthCorner?.valid
          ) {
            this.canMatbiaCardSetup(true);
            this.matbiaCardForm.setAllVisited();
          }

          // if Card is not Active then open info panel
          if (!this.cardSettingData.isActive) {
          }

          if (this.matbiaCardForm.isEndWithNine(this.cardSettingData.expiry) || !this.isAllowToBack()) {
            if (this.matbiaCardForm.isEndWithNine(this.cardSettingData.expiry)) {
              this.isEndWithnine = true;
            }
            this.matbiaCardDetailForm.patchValue({
              corner4: this.matbiaFormGroupService.getCornerValidValue('0'),
            });

            this.matbiaCardForm.setFourthCornerVisited();
            this.matbiaCardDetailForm.updateValueAndValidity();
          }
        }
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  onUpdate() {
    if (this.matbiaCardDetailForm.invalid) {
      this.matbiaCardDetailForm.markAllAsTouched();

      if (
        this.matbiaCardForm.FirstCorner?.invalid ||
        this.matbiaCardForm.SecondCorner?.invalid ||
        this.matbiaCardForm.ThirdCorner?.invalid ||
        this.matbiaCardForm.FourthCorner?.invalid
      ) {
        return;
      }

      if (this.CVV?.invalid) {
        this.matbiaCardForm.openCardPinPopup();
        return;
      }

      this.isAnimate = true;

      setTimeout(() => {
        this.isAnimate = false;
      }, 1500);
      return;
    }

    const cardPayload = {
      cardId: this.matbiaCardDetailForm.get('cardId')?.value,
      pin: this.matbiaCardDetailForm.get('cvv')?.value,
      cardHolderName: this.matbiaCardDetailForm.get('nameOnCard')?.value,
      phoneNum: this.matbiaCardDetailForm.get('phoneNum')?.value,
      corner1: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner1')?.value),
      corner2: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner2')?.value),
      corner3: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner3')?.value),
      corner4: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner4')?.value),
      createdBy: this.localStorage.getLoginUserId() || 0,
      statusID: this.matbiaCardDetailForm.get('statusID')?.value,

      IsActive: this.cardSettingData.isActive ? null : true,
    };

    this.isLoading = true;

    this.matbiaCardSettingAPI.SaveSetting(cardPayload).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.displayLockPopup();
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  displayLockPopup() {
    if (this.isCardLock()) {
      const modalRef = this.panelPopupService.openCardLockPopup();
      modalRef.closed.subscribe(() => {
        this.router.navigate(this.pageRoute.getCardsRouterLink());
      });

      return;
    }

    if (this.cardSettingData && !this.isAllowToBack()) {
      this.router.navigate(this.pageRoute.getNotificationRouterLink(), {
        queryParams: {
          cardId: this.cardSettingData.cardId,
          allowSkip: true,
        },
        queryParamsHandling: 'merge',
      });
      return;
    }

    this.router.navigate([...this.pageRoute.getCardsRouterLink(), this.cardSettingData.cardId, 'card-details']);
  }

  openCardReplacePopup() {
    const modalRef = this.panelPopupService.openReplaceCardPopup();

    modalRef.componentInstance.userHandle = this.localStorage.getLoginUserUserName();

    modalRef.componentInstance.cardIdForReplace = this.matbiaCardDetailForm.get('cardId')?.value;

    modalRef.componentInstance.cardNumber = this.matbiaCardDetailForm.get('cardNumber')?.value;

    modalRef.closed.subscribe(() => {});
  }

  unLockCard() {
    this.matbiaCardForm.unLockCard();
  }

  openCardLockModal() {
    this.matbiaCardForm.openCardLockModal();
  }

  onCancel(event: Event) {
    event.preventDefault();

    this.matbiaCardDetailForm.patchValue({
      nameOnCard: this.cardSettingData.cardHolderName,
      cardNumber: this.cardSettingData.cardNum,
      cardId: this.cardSettingData.cardId,
      cardExp: this.cardSettingData.expiry,
      corner1: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner1),
      corner2: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner2),
      corner3: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner3),
      corner4: this.matbiaFormGroupService.getCornerValidValue(this.cardSettingData.corner4),
      cvv: this.cardSettingData.pin,
      phoneNum: this.cardSettingData.phoneNum,
      statusID: this.cardSettingData.statusID || 0,
    });

    this.matbiaCardForm.canSubmit = false;
    this.matbiaCardDetailForm.updateValueAndValidity();
  }
}
