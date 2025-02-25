import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  AfterContentInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Assets } from '@enum/Assets';
import { shakeTrigger } from '@commons/animations';
import { CommonDataService } from '@commons/common-data-service.service';
import { AbstractControlWarning } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';
import { OrgObj, OrganizationAPIService } from '@services/API/organization-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-report-missing-organization',
  templateUrl: './report-missing-organization.component.html',
  styleUrls: ['./report-missing-organization.component.scss'],
  imports: [SharedModule, PhoneInputComponent, InputErrorComponent, AddressAutocompleteDirective],
  animations: [shakeTrigger],
})
export class ReportMissingOrganizationComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  private _isAnimate = false;

  profileIcon = Assets.PROFILE_IMAGE;
  employerIdMask = '00-0000000';
  zipCodeMask: string = '00000';
  zipCodeValidation = true;

  organization!: OrgObj;

  @Input() isThankYou = false;

  @Input() reportedOrganizationName = '';

  @Input() orgId!: string;

  @Input() isSuggestion = false;

  @Output() openThankYouModal: EventEmitter<string> = new EventEmitter();

  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  formGroup!: FormGroup;

  get OrgName() {
    return this.formGroup.get('orgName');
  }

  get TaxID() {
    return this.formGroup.get('taxID');
  }

  get Address(): AbstractControlWarning | null {
    return this.formGroup.get('address');
  }

  get City(): AbstractControlWarning | null {
    return this.formGroup.get('city');
  }

  get State() {
    return this.formGroup.get('state');
  }

  get Zip() {
    return this.formGroup.get('zip');
  }

  get ContactName() {
    return this.formGroup.get('contactName');
  }

  get ContactNumber() {
    return this.formGroup.get('contactNumber');
  }

  get Email() {
    return this.formGroup.get('email');
  }

  get inAnimation() {
    return this._isAnimate;
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private notification: NotificationService,
    public commonDataService: CommonDataService,
    private organizationAPI: OrganizationAPIService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      orgID: this.fb.control(null),
      orgName: this.fb.control(null, Validators.compose([Validators.required])),
      taxID: this.fb.control(null, Validators.compose([Validators.required])),
      contactName: this.fb.control(null),
      contactNumber: this.fb.control(null, Validators.compose([])),
      email: this.fb.control(null, Validators.compose([Validators.email])),
      address: this.fb.control(null, Validators.compose([])),
      city: this.fb.control(null, Validators.compose([])),
      state: this.fb.control(null, Validators.compose([])),
      zip: this.fb.control(null, Validators.compose([Validators.minLength(5), Validators.maxLength(5)])),
    });

    if (this.orgId) {
      this.getOrganizationDetails();
    }
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  closePopup() {
    this.activeModal.dismiss();
    if (this.isThankYou) {
      this.refresh.emit(true);
    }
  }

  private getOrganizationDetails() {
    this.organizationAPI.getOrganizationById(this.orgId).subscribe(
      (res) => {
        if (res) {
          this.organization = res;
          this.formGroup.patchValue({
            orgID: this.organization.suggestedOrgId,
            orgName: this.organization?.businessName,
          });
        }
      },
      () => {}
    );
  }

  triggerAnimation() {
    this._isAnimate = true;
    setTimeout(() => {
      this._isAnimate = false;
    }, 1500);
  }

  onAddressChange(data: any) {
    if (data.notFound) {
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

    this.formGroup.patchValue({
      address: streetAddress,
      city: data.locality.long || data.locality.short || data.sublocality,
      state: data.state.short,
      zip: data.postalCode,
    });

    if (!data?.country?.isFromUSA) {
      this.zipCodeMask = '';
      this.zipCodeValidation = false;
      this.Zip?.clearValidators();
      this.Zip?.updateValueAndValidity();
    }

    if (data?.country?.isFromUSA) {
      this.zipCodeMask = '00000';
      this.zipCodeValidation = true;
      this.Zip?.clearValidators();
      this.Zip?.setValidators(Validators.compose([Validators.minLength(5), Validators.maxLength(5)]));
      this.Zip?.updateValueAndValidity();
    }

    this.formGroup.updateValueAndValidity();
  }

  displayOrgDetails(): string {
    return this.organization?.businessName;
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    this.closePopup();
    this.doSuggestionAction();
  }

  private doSuggestionAction() {
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        return;
      }
    });

    this.organizationAPI
      .suggestOrganization({
        ...this.formGroup.value,
      })
      .subscribe(
        () => {
          this.notification.close();
          this.openThankYouModal.emit(this.OrgName?.value);
        },
        (err) => {
          this.notification.hideLoader();
          this.notification.displayError(err.error);
        }
      );
  }
}
