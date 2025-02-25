import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonDataService } from '@commons/common-data-service.service';
import { CustomValidator } from '@commons/custom-validator';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MATBIA_CARD_STATUS } from '@enum/MatbiaCard';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { DonorAPIService } from '@services/API/donor-api.service';
import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';

@Component({
  selector: 'app-activate-card',
  imports: [InputErrorComponent, ReactiveFormsModule],
  templateUrl: './activate-card.component.html',
  styleUrl: './activate-card.component.scss',
})
export class ActivateCardComponent {
  isUserLoggedIn: any;
  constructor(
    private localStorageDataService: LocalStorageDataService,
    private matbiaCardAPI: MatbiaCardAPIService,
    private route: Router,
    private fb: UntypedFormBuilder,
    private commonService: CommonDataService,
    private notificationService: NotificationService,
    private donorAPI: DonorAPIService,
    private pageRoute: PageRouteVariable
  ) {}

  formGroup!: FormGroup;

  get cardNumber() {
    return this.formGroup.get('cardNumber');
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      cardNumber: new FormControl(
        '',
        Validators.compose([Validators.required, CustomValidator.cardValidator(this.commonService)])
      ),
    });
    const state = history.state;
    this.isUserLoggedIn = state?.isUserLoggedIn ?? false;
  }

  ValidateCard() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const cardNumber = this.cardNumber?.value?.replace(/[-\s]/g, '');
    const emailValue = this.localStorageDataService.getUserCardOrEmailValue()?.cardOrEmailValue;
    this.matbiaCardAPI.validateCard(cardNumber, emailValue, '').subscribe((res: ValidateCardResponse) => {
      if (res) {
        if (this.isUserLoggedIn) {
          if (res.status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
            this.linkCardWithDonor(res.cardId);
            return;
          }

          if (res && res.error) {
            this.notificationService.showError(res.error, 'Error !');
            return;
          }

          if (res.status === MATBIA_CARD_STATUS.DISABLED) {
            this.notificationService.showError('Card is Disabled', 'Error !');
            return;
          }

          if (res.status === MATBIA_CARD_STATUS.EMAIL_CARD_EXISTS) {
            this.notificationService.showError('Card already active', 'Error !');
            return;
          }

          if (res.status === MATBIA_CARD_STATUS.EMAIL_EXISTS) {
            this.notificationService.showError('Card already active', 'Error !');
            return;
          }

          if (res.status === MATBIA_CARD_STATUS.ACTIVE) {
            this.notificationService.showError('Card already active', 'Error !');
            return;
          }
        } else {
          this.route.navigate(['/setup-card-setting'], {
            queryParams: { userHandle: this.localStorageDataService.getLoginUserUserName(), activeStep: 0 },
            state: { cardNumber: cardNumber, cardId: res.cardId, expiry: res.expiry },
          });
        }
      }
    });
  }

  linkCardWithDonor(cardId: string) {
    const entityId = this.localStorageDataService.getLoginUserEncryptedId();
    this.donorAPI.linkMatbiaCard({ cardId, entityId }).subscribe(
      (res) => {
        if (res.errors && res.errors.length > 0) {
          this.notificationService.showError(res.errors[0].error, 'Error !');
          return;
        }
        if (res.success) {
          this.route.navigate([...this.pageRoute.getCardsRouterLink(), cardId, 'card-details']);
        }
      },
      (err) => {
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }
}
