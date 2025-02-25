import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Params } from '@enum/Params';
import { CustomValidator } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';
import { MATBIA_CARD_STATUS } from '@enum/MatbiaCard';
import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';
import { LandingModuleService } from '../landing-module.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { DonorAPIService } from '@services/API/donor-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';

@Component({
  selector: 'app-activate-card-popup',
  templateUrl: './activate-card-popup.component.html',
  styleUrls: ['./activate-card-popup.component.scss'],
  imports: [SharedModule, CreditCardInputComponent],
})
export class ActivateCardPopupComponent implements OnInit {
  isLoading = false;
  isValidate = false;
  isAllowForPIN = false;

  isEmailAndCardExists = false;
  isEmailExists = false;

  isProfileInComplete = false;

  alertMessage = '';
  cardId!: string;
  entityId!: string;

  activateCardForm!: UntypedFormGroup;

  @Input() emailValue: string | null = null;

  @Input() isFromSendMeCard = false;

  cardMask = '0000-0000-0000-0000';

  get CCNum() {
    return this.activateCardForm.get('card');
  }

  get Email() {
    return this.activateCardForm.get('email');
  }

  get ReferredBy() {
    return this.activateCardForm.get('referredEntityID');
  }

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public activeModal: NgbActiveModal,
    private fb: UntypedFormBuilder,
    private matbiaCardAPI: MatbiaCardAPIService,
    private donorAPI: DonorAPIService,
    private notificationService: NotificationService,
    private landingModuleService: LandingModuleService,
    private localStorageService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.activateCardForm = this.fb.group({
      card: this.fb.control('', Validators.compose([Validators.required])),
      email: this.fb.control(this.emailValue, Validators.compose([CustomValidator.email()])),
      referredEntityID: this.fb.control(null),
    });

    this.activeRoute.queryParamMap.subscribe((params) => {
      if (params.get(Params.SHUL_KIOSK)) {
        this.isAllowForPIN = true;
      }

      const referred = params.get(Params.REFERRED_BY);
      if (referred) {
        this.activateCardForm.patchValue({
          referredEntityID: referred,
        });

        this.activateCardForm.updateValueAndValidity();
      }
    });
  }

  onClose() {
    this.activeModal.close();
  }

  onSubmit() {
    if (this.isAllowForPIN && this.activateCardForm.valid) {
      this.onValidate();
      return;
    }

    if (this.activateCardForm.valid) {
      this.onValidateCard();
      return;
    }
  }

  onValidate() {
    this.isLoading = true;

    const validEmailValue = this.Email?.value;

    this.matbiaCardAPI.validateCard(this.CCNum?.value, validEmailValue, this.ReferredBy?.value).subscribe(
      (res: ValidateCardResponse) => {
        this.isLoading = false;
        if (res && res.error) {
          this.alertMessage = res.error;
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.DISABLED) {
          this.alertMessage = 'Card is Disabled';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
          this.isValidate = true;
          this.cardId = res.cardId;
          this.entityId = res.entityId || '';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.EMAIL_CARD_EXISTS) {
          this.isValidate = true;
          this.isEmailExists = true;
          this.cardId = res.cardId;
          this.alertMessage = 'email already exists';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.EMAIL_EXISTS) {
          this.isValidate = true;
          this.isEmailExists = true;
          this.cardId = res.cardId;
          this.alertMessage = 'email already exists';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.ACTIVE && this.isAllowForPIN) {
          this.onClose();
          this.cardId = res.cardId;
          this.router.navigate([`auth`, 'card-login', this.cardId], { queryParamsHandling: 'preserve' });
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.ACTIVE && !this.isAllowForPIN) {
          this.onClose();
          this.router.navigate([`auth`, 'login']);
          return;
        }
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  goToSetup() {
    this.onClose();
    if (this.isAllowForPIN) {
      this.router.navigate([`signup-card`], {
        queryParams: { cardId: this.cardId, cardEntityId: this.entityId },
        queryParamsHandling: 'merge',
      });
      return;
    }

    if (!this.isAllowForPIN) {
      this.router.navigate([`signup`], {
        queryParams: { cardId: this.cardId, cardEntityId: this.entityId },
        queryParamsHandling: 'merge',
      });
      return;
    }
  }

  goToCardLoginPage() {
    this.onClose();
    this.router.navigate([`auth`, 'card-login', this.cardId], { queryParamsHandling: 'preserve' });
  }

  goToAuth() {
    this.onClose();
    this.router.navigate([`auth`, 'login']);
  }

  onValidateCard() {
    this.isLoading = true;
    this.matbiaCardAPI.validateCard(this.CCNum?.value).subscribe(
      (res: ValidateCardResponse) => {
        if (res.status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
          this.linkCardWithDonor(res.cardId);
          return;
        }

        this.isLoading = false;
        if (res && res.error) {
          this.alertMessage = res.error;
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.DISABLED) {
          this.alertMessage = 'Card is Disabled';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.EMAIL_CARD_EXISTS) {
          this.alertMessage = 'Card already active';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.EMAIL_EXISTS) {
          this.alertMessage = 'Card already active';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.ACTIVE) {
          this.alertMessage = 'Card already active';
          return;
        }
      },
      (err) => {
        this.isLoading = false;
        this.alertMessage = err.error;
      }
    );
  }

  linkCardWithDonor(cardId: string) {
    const entityId = this.localStorageService.getLoginUserEncryptedId();
    this.donorAPI.linkMatbiaCard({ cardId, entityId }).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.errors && res.errors.length > 0) {
          this.notificationService.showError(res.errors[0].error, 'Error !');
          return;
        }
        if (res.success) {
          this.onClose();
          this.goToCardSettingPage();
          return;
        }
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  /**
   * Navigate to Card setting page with check condition if it's from send me card then need to go first PIN page
   */
  private goToCardSettingPage() {
    this.landingModuleService.goToCardSettingPage({
      userHandle: this.localStorageService.getLoginUserUserName(),
      activeStep: this.isFromSendMeCard ? 0 : 1,
      isFromSendMeCard: this.isFromSendMeCard,
    });
  }
}
