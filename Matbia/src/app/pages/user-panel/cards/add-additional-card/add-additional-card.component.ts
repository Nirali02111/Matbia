import { AfterContentInit, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MATBIA_CARD_STATUS } from '@enum/MatbiaCard';
import { DonorAPIService } from '@services/API/donor-api.service';
import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';
import { Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-add-additional-card',
  templateUrl: './add-additional-card.component.html',
  styleUrls: ['./add-additional-card.component.scss'],
  imports: [SharedModule, ButtonLoaderComponent, CreditCardInputComponent],
})
export class AddAdditionalCardComponent implements OnInit, AfterContentInit, AfterViewInit {
  @ViewChild('cardNumber') cardNumber!: CreditCardInputComponent;

  isLoading = false;

  activateCardForm!: UntypedFormGroup;

  get CCNum() {
    return this.activateCardForm.get('card');
  }

  constructor(
    protected title: Title,
    private fb: UntypedFormBuilder,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private matbiaCardAPI: MatbiaCardAPIService,
    private donorAPI: DonorAPIService,
    private localStorage: LocalStorageDataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Add Additional Card');
    this.activateCardForm = this.fb.group({
      card: this.fb.control('', Validators.compose([Validators.required])),
    });
  }

  ngAfterContentInit(): void {}

  ngAfterViewInit(): void {
    this.cardNumber.doFocus();
  }

  onValidate() {
    this.isLoading = true;
    this.matbiaCardAPI.validateCard(this.CCNum?.value).subscribe(
      (res: ValidateCardResponse) => {
        if (res.status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
          this.linkCardWithDonor(res.cardId);
          return;
        }

        this.isLoading = false;
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
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }

  linkCardWithDonor(cardId: string) {
    const entityId = this.localStorage.getLoginUserEncryptedId();
    this.donorAPI.linkMatbiaCard({ cardId, entityId }).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.errors && res.errors.length > 0) {
          this.notificationService.showError(res.errors[0].error, 'Error !');
          return;
        }
        if (res.success) {
          this.router.navigate([...this.pageRoute.getCardsRouterLink(), cardId, 'card-details']);
        }
      },
      (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error, 'Error !');
      }
    );
  }
}
