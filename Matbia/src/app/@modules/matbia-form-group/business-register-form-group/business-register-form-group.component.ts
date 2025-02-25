import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { shakeTrigger } from '@commons/animations';
import { CommonDataService } from '@commons/common-data-service.service';
import { CommonAPIMethodService } from '@services/API/common-api-method.service';
import { Subscription } from 'rxjs';
import { BusinessType, NaicsCategories } from 'src/app/models/common-api-model';

import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import { SharedModule } from '@matbia/shared/shared.module';
import { AddressAutocompleteDirective } from '@matbia/matbia-directive/address-autocomplete.directive';

@Component({
  selector: 'app-business-register-form-group',
  templateUrl: './business-register-form-group.component.html',
  styleUrls: ['./business-register-form-group.component.scss'],
  imports: [SharedModule, PhoneInputComponent, InputErrorComponent, AddressAutocompleteDirective],
  animations: [shakeTrigger],
})
export class BusinessRegisterFormGroupComponent implements OnInit, AfterContentInit, OnDestroy {
  zipCodeMask: string = '00000';

  @Input() employerIdMask = '00-0000000';

  @Input() formGroup!: UntypedFormGroup;

  @Output() naicInit = new EventEmitter<boolean>();

  @Output() fgSubmit = new EventEmitter();

  isSubmitted = false;
  inAnimation = false;
  listOfBusinessTypes: Array<BusinessType> = [];
  listNAICList: NaicsCategories = {};
  listOfNAICCategory: Array<{ id: string; label: string }> = [];
  listOfNAICSub: Array<{ code: number; subcategory: string }> = [];

  subscription!: Subscription;
  naicsubscription!: Subscription;

  // Forms fields
  get BusinessType() {
    return this.formGroup.get('businessType');
  }

  get Naics() {
    return this.formGroup.get('naics');
  }

  get NaicsCode() {
    return this.formGroup.get('naicsCode');
  }

  get BusinessName() {
    return this.formGroup.get('businessName');
  }

  get Address() {
    return this.formGroup.get('address');
  }

  get Address2() {
    return this.formGroup.get('address2');
  }

  get City() {
    return this.formGroup.get('city');
  }

  get State() {
    return this.formGroup.get('state');
  }

  get Zip() {
    return this.formGroup.get('zip');
  }

  get EmployerId() {
    return this.formGroup.get('employerId');
  }

  get BusinessEmail() {
    return this.formGroup.get('businessEmail');
  }

  get Phone() {
    return this.formGroup.get('phone');
  }

  get OfficePhone() {
    return this.formGroup.get('officePhone');
  }

  get DoingBusinessAs() {
    return this.formGroup.get('doingBusinessAs');
  }

  get BusinessWebsite() {
    return this.formGroup.get('businessWebsite');
  }

  setIsSubmitted() {
    this.isSubmitted = true;
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonDataService: CommonDataService,
    private commonAPIDataService: CommonAPIMethodService
  ) {}

  ngOnInit(): void {
    this.subscription = this.commonAPIDataService
      .getBusinessTypes()
      .subscribe((list) => (this.listOfBusinessTypes = list));

    this.naicsubscription = this.commonAPIDataService.getNaicsCategories().subscribe((response) => {
      this.listNAICList = response;
      for (const key in this.listNAICList) {
        if (this.listNAICList[key]) {
          this.listOfNAICCategory.push({ id: key, label: key });
        }
      }
      this.naicInit.emit(true);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.naicsubscription.unsubscribe();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
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

  onSelectNAIC() {
    this.listOfNAICSub = this.listNAICList[this.Naics?.value];
    this.formGroup.patchValue({
      naicsCode: '',
    });
  }

  onAddressChange(data: any) {
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
      this.Zip?.clearValidators();
      this.Zip?.updateValueAndValidity();
    }

    if (data?.country?.isFromUSA) {
      this.zipCodeMask = '00000';
      this.Zip?.clearValidators();
      this.Zip?.setValidators(
        Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])
      );
      this.Zip?.updateValueAndValidity();
    }

    this.formGroup.updateValueAndValidity();
  }

  customSearchFn(term: string, item: { item_id: string; item_text: string }) {
    const terms = term.toLowerCase();
    return item.item_text.toLowerCase().indexOf(terms) > -1 || item.item_id.toLowerCase() === terms;
  }

  triggerRegister() {
    this.fgSubmit.emit(true);
  }

  setNAIC() {
    if (this.NaicsCode?.value) {
      for (const key in this.listNAICList) {
        if (this.listNAICList[key]) {
          const categories = this.listNAICList[key];

          const find = categories.find((o) => {
            return o.code === this.NaicsCode?.value;
          });

          if (find) {
            this.listOfNAICSub = categories;

            this.Naics?.patchValue(key);
            this.Naics?.updateValueAndValidity();
            this.formGroup.updateValueAndValidity();
          }
        }
      }
    }
  }
}
