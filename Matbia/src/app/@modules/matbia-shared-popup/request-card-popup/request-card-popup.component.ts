import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { shakeTrigger } from '@commons/animations';
import { CustomValidator } from '@commons/custom-validator';
import { MatbiaCardAPIService } from '@services/API/matbia-card-api.service';
import { ActivatedRoute } from '@angular/router';
import { Params } from '@enum/Params';
import { AnalyticsService } from '@services/analytics.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-request-card-popup',
  templateUrl: './request-card-popup.component.html',
  styleUrls: ['./request-card-popup.component.scss'],
  imports: [SharedModule, PhoneInputComponent, InputErrorComponent, AddressAutocompleteDirective],
  animations: [shakeTrigger],
})
export class RequestCardPopupComponent implements OnInit {
  isLoading = false;

  isSubmited = false;
  inAnimation = false;

  isAutoSuggestion = true;

  @Input() isRequested = false;

  requestCardForm!: UntypedFormGroup;

  get Name() {
    return this.requestCardForm.get('data_input_field_1');
  }

  get Address() {
    return this.requestCardForm.get('data_input_field_2');
  }

  get Apt() {
    return this.requestCardForm.get('apt');
  }

  get CityStateZip() {
    return this.requestCardForm.get('cityStateZip');
  }

  get Email() {
    return this.requestCardForm.get('email');
  }

  get Phone() {
    return this.requestCardForm.get('phone');
  }

  get ContactMessage() {
    return this.requestCardForm.get('message');
  }

  get ReferredBy() {
    return this.requestCardForm.get('referredEntityID');
  }

  constructor(
    private fb: UntypedFormBuilder,
    private activeRoute: ActivatedRoute,
    public activeModal: NgbActiveModal,
    private matbiaCardAPI: MatbiaCardAPIService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.requestCardForm = this.fb.group({
      data_input_field_1: this.fb.control(
        '',
        Validators.compose([Validators.required, CustomValidator.requiredNoWhiteSpace()])
      ),
      data_input_field_2: this.fb.control(
        '',
        Validators.compose([Validators.required, CustomValidator.requiredNoWhiteSpace()])
      ),
      apt: this.fb.control('', Validators.compose([CustomValidator.requiredNoWhiteSpace()])),
      cityStateZip: this.fb.control(
        '',
        Validators.compose([Validators.required, CustomValidator.requiredNoWhiteSpace()])
      ),
      email: this.fb.control('', Validators.compose([CustomValidator.email()])),
      phone: this.fb.control('', Validators.compose([Validators.required])),
      message: this.fb.control('', Validators.compose([Validators.required])),

      referredEntityID: this.fb.control(null),
    });

    this.activeRoute.queryParamMap.subscribe((params) => {
      const hasMessage = params.get('message');
      const cardRequest = params.get(Params.CARD_REQUEST);
      const referred = params.get(Params.REFERRED_BY);

      if (hasMessage && cardRequest) {
        this.requestCardForm.patchValue({
          message: hasMessage,
        });
        this.requestCardForm.updateValueAndValidity();
        this.ContactMessage?.disable();
      }

      if (referred) {
        this.requestCardForm.patchValue({
          referredEntityID: referred,
        });
        this.requestCardForm.updateValueAndValidity();
      }
    });
  }

  onClose() {
    this.activeModal.close();
  }

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  onAddressChange(data: any) {
    if (data.notFound) {
      this.isSubmited = true;
      this.Address?.setErrors({
        googleMapError: data.notFound,
      });

      this.Address?.markAsTouched();

      this.triggerAnimation();
      return;
    }

    let streetAddress = data.streetName;

    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }

    this.requestCardForm.patchValue({
      data_input_field_2: streetAddress,
      cityStateZip: `${data.locality.long || data.locality.short || data.sublocality}, ${data.state.short}, ${
        data.postalCode
      }`,
    });

    this.requestCardForm.updateValueAndValidity();
  }

  goToSetup() {}

  onRequest() {
    this.isSubmited = true;

    if (this.requestCardForm.invalid) {
      this.triggerAnimation();
      this.requestCardForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payloadData = {
      fullName: this.Name?.value,
      apt: this.Apt?.value,
      mailingAddress: this.Address?.value,
      cityStateZip: this.CityStateZip?.value,
      phone: this.Phone?.value,
      email: this.Email?.value,
      hearAboutUs: this.ContactMessage?.value,
      referredEntityID: this.ReferredBy?.value,
      entityID: '',
    };

    this.matbiaCardAPI.requestCard(payloadData).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          this.isRequested = true;
          this.analytics.initCardRequestEvent();
        }
      },
      () => {
        this.isLoading = false;
        this.isRequested = true;
      }
    );
  }
}
