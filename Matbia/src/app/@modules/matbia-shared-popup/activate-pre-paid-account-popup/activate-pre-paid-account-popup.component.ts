import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Params } from '@enum/Params';
import { MATBIA_CARD_STATUS } from '@enum/MatbiaCard';
import { CustomValidator } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';
import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';

@Component({
  selector: 'app-activate-pre-paid-account-popup',
  templateUrl: './activate-pre-paid-account-popup.component.html',
  styleUrls: ['./activate-pre-paid-account-popup.component.scss'],
  imports: [SharedModule, CreditCardInputComponent],
})
export class ActivatePrePaidAccountPopupComponent implements OnInit {
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
    private notificationService: NotificationService
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
    if (this.activateCardForm.invalid) {
      this.activateCardForm.markAllAsTouched();
      return;
    }

    this.onValidate();
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

        if (res.status === MATBIA_CARD_STATUS.EMAIL_CARD_EXISTS) {
          this.isValidate = true;
          this.isEmailExists = true;
          this.alertMessage = 'email already exists';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.EMAIL_EXISTS) {
          this.isValidate = true;
          this.isEmailExists = true;
          this.alertMessage = 'email already exists';
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
          this.isValidate = true;
          this.cardId = res.cardId;
          if (!res.entityId) {
            this.entityId = '';
            return;
          }
          this.entityId = res.entityId || '';
          this.goToSetup();
          return;
        }

        if (res.status === MATBIA_CARD_STATUS.ACTIVE) {
          this.isValidate = true;
          this.isEmailExists = true;
          this.entityId = res.entityId || '';
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
    this.router.navigate([`signup-card`], {
      queryParams: { cardId: this.cardId, cardEntityId: this.entityId, isPrePaidAccount: true },
      queryParamsHandling: 'merge',
    });
    return;
  }

  goToCardLoginPage() {
    this.onClose();
    this.router.navigate([`auth`, 'card-login', this.cardId], { queryParamsHandling: 'preserve' });
  }

  goToAuth() {
    this.onClose();
    this.router.navigate([`auth`, 'login']);
  }
}
