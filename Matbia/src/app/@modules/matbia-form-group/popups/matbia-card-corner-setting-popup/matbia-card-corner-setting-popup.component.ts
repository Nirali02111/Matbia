import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { shakeTrigger } from '@commons/animations';
import { CommonDataService } from '@commons/common-data-service.service';
import { CustomValidator } from '@commons/custom-validator';
import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface InputAmountAndCorner {
  inputValue: string;
}

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-matbia-card-corner-setting-popup',
  templateUrl: './matbia-card-corner-setting-popup.component.html',
  styleUrl: './matbia-card-corner-setting-popup.component.scss',
  imports: [SharedModule],
  animations: [shakeTrigger],
})
export class MatbiaCardCornerSettingPopupComponent implements OnInit, AfterContentInit, AfterViewInit {
  inAnimation = false;

  @Input() cornerId!: number;

  @Input() initValue!: FormGroup;

  formGroup!: FormGroup;

  @Output() saveDetails = new EventEmitter();

  get cornerAmountType() {
    return this.formGroup?.get('amountType');
  }

  public formatPresetAmt$ = new Subject<InputAmountAndCorner>();

  public formatChargeRandomAmt$ = new Subject<InputAmountAndCorner & { attemptField: string }>();
  public formatCapAtpAmt$ = new Subject<InputAmountAndCorner & { attemptField: string }>();

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal,
    private commonDataService: CommonDataService,
    private formGroupService: MatbiaFormGroupService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formGroupService.initCorner('');

    this.onUpdateCornerValue();

    this.formatPresetAmt$.pipe(debounceTime(300)).subscribe(({ inputValue }) => {
      if (inputValue != '') {
        const toFix = this.commonDataService.getNumberWithFormate(inputValue);
        this.formGroup?.get('value')?.setValue(toFix, { emitEvent: true });
      }
    });

    this.formatChargeRandomAmt$.pipe(debounceTime(300)).subscribe(({ inputValue, attemptField }) => {
      if (inputValue != '') {
        const toFix = this.commonDataService.getNumberWithFormate(inputValue);
        this.formGroup?.get('chargeRandomAmount')?.get(attemptField)?.setValue(toFix, { emitEvent: true });
      }
    });

    this.formatCapAtpAmt$.pipe(debounceTime(300)).subscribe(({ inputValue, attemptField }) => {
      if (inputValue != '') {
        const toFix = this.commonDataService.getNumberWithFormate(inputValue);
        this.formGroup?.get('capPerUser')?.get(attemptField)?.setValue(toFix, { emitEvent: true });
      }
    });

    this.formGroup
      ?.get('capPerUser')
      ?.get('attempt3')
      ?.valueChanges.subscribe((val) => {
        if (val) {
          this.formGroup?.get('capPerUser')?.get('attempt4')?.enable();
          this.changeDetectorRef.detectChanges();
          return;
        }
        this.formGroup?.get('capPerUser')?.get('attempt4')?.disable();

        this.changeDetectorRef.detectChanges();
      });

    this.formGroup.patchValue(this.initValue);
    this.formGroup.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onPresetAmtAdd(event: any) {
    this.formatPresetAmt$.next({ inputValue: (event.target as HTMLInputElement).value });
  }

  onChangeRandomMaxAmtAdd(event: any, attemptField: string) {
    this.formatChargeRandomAmt$.next({ inputValue: (event.target as HTMLInputElement).value, attemptField });
  }

  onChangeSetupCapPerUserAtpAmtAdd(event: any, attemptField: string) {
    this.formatCapAtpAmt$.next({ inputValue: (event.target as HTMLInputElement).value, attemptField });
  }

  getValueOfSelect(val: string) {
    if (val === '2') {
      return '0';
    }

    if (val === '3') {
      return 'Req';
    }

    return '';
  }

  onUpdateCornerValue() {
    this.cornerAmountType?.valueChanges.subscribe((val) => {
      const tmp = this.getValueOfSelect(val);
      this.changeValidation(val, tmp);

      this.formGroup.updateValueAndValidity();
      this.changeDetectorRef.detectChanges();
    });
  }

  changeValidation(changeType: string, value: string) {
    /**
     * clear all validation for corners
     */
    this.formGroup?.get('value')?.clearValidators();

    this.formGroup?.get('capPerUser')?.get('attempt1')?.clearValidators();
    this.formGroup?.get('capPerUser')?.get('attempt2')?.clearValidators();
    this.formGroup?.get('capPerUser')?.get('days')?.clearValidators();

    this.formGroup?.get('chargeRandomAmount')?.get('minValue')?.clearValidators();
    this.formGroup?.get('chargeRandomAmount')?.get('maxValue')?.clearValidators();
    this.formGroup?.get('chargeRandomAmount')?.clearValidators();

    /**
     * after clearing update value and validity so all previous error will remove
     */
    this.formGroup?.get('value')?.updateValueAndValidity();
    this.formGroup?.get('capPerUser')?.get('attempt1')?.updateValueAndValidity();
    this.formGroup?.get('capPerUser')?.get('attempt2')?.updateValueAndValidity();
    this.formGroup?.get('capPerUser')?.get('days')?.updateValueAndValidity();
    this.formGroup?.get('chargeRandomAmount')?.get('minValue')?.updateValueAndValidity();
    this.formGroup?.get('chargeRandomAmount')?.get('maxValue')?.updateValueAndValidity();
    this.formGroup?.get('chargeRandomAmount')?.updateValueAndValidity();

    if (changeType === '1' || changeType === '2' || changeType === '3') {
      if (changeType === '1') {
        this.formGroup
          ?.get('value')
          ?.setValidators(
            Validators.compose([
              Validators.required,
              Validators.max(9999),
              CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
            ])
          );
      } else {
        this.formGroup?.get('value')?.setValidators(Validators.compose([Validators.required]));
      }

      this.formGroup?.patchValue({
        value,
      });

      this.formGroup?.markAllAsTouched();
      this.formGroup?.updateValueAndValidity();
      return;
    }

    if (changeType === '4') {
      this.formGroup
        ?.get('capPerUser')
        ?.get('attempt1')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );
      this.formGroup
        ?.get('capPerUser')
        ?.get('attempt2')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );

      this.formGroup
        ?.get('capPerUser')
        ?.get('days')
        ?.setValidators(Validators.compose([Validators.required]));

      this.formGroup?.markAllAsTouched();
      this.formGroup?.updateValueAndValidity();
      return;
    }

    if (changeType === '5') {
      this.formGroup
        ?.get('chargeRandomAmount')
        ?.get('minValue')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );
      this.formGroup
        ?.get('chargeRandomAmount')
        ?.get('maxValue')
        ?.setValidators(
          Validators.compose([
            Validators.required,
            Validators.max(9999),
            CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
          ])
        );

      this.formGroup?.get('chargeRandomAmount')?.setValidators(CustomValidator.crossField('minValue', 'maxValue'));

      this.formGroup?.markAllAsTouched();
      this.formGroup?.updateValueAndValidity();
    }
  }

  needToAnimate(ctrl: AbstractControl | null | undefined) {
    if (ctrl && ctrl.touched && ctrl.invalid && this.inAnimation) {
      return true;
    }

    return false;
  }

  needToCheckMax(form: FormGroup) {
    if (form && form.get('minValue')?.valid && form.get('maxValue')?.valid && form.invalid && this.inAnimation) {
      return true;
    }

    return false;
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

  onSubmit() {
    if (this.formGroup.invalid) {
      this.triggerAnimation();
      return;
    }

    this.closePopup();
    this.saveDetails.emit(this.formGroup.value);
  }
}
