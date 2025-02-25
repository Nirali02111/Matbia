import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  Provider,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  UntypedFormControl,
  FormControlDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

const PHONE_INPUT_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => PhoneInputComponent),
  multi: true,
};

const PHONE_INPUT_CONTROL_VALIDATORS_ACCESSOR: Provider = {
  provide: NG_VALIDATORS,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => PhoneInputComponent),
  multi: true,
};

const isAllCharactersSame = (s: string | null) => {
  if (!s) {
    return false;
  }

  let n = s.length;
  for (let i = 1; i < n; i++) if (s[i] != s[0]) return false;

  return true;
};

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-phone-input',
  template: `
    <input
      class="form-control"
      type="tel"
      [validation]="true"
      [mask]="cardMask"
      [formControl]="control"
      (input)="onChange($event)"
      (blur)="onTouched()"
      (change)="saveValueAction($event)"
      [placeholder]="placeholder"
      [attr.id]="fieldId ? fieldId : null"
      #intElm
    />

    <ng-container *ngIf="control?.touched && control?.invalid && isSubmit">
      <app-input-error [errors]="control?.errors"></app-input-error>
    </ng-container>
  `,
  providers: [PHONE_INPUT_CONTROL_VALUE_ACCESSOR, PHONE_INPUT_CONTROL_VALIDATORS_ACCESSOR],
  imports: [SharedModule, InputErrorComponent],
})
export class PhoneInputComponent implements OnInit, ControlValueAccessor, AfterContentInit, Validator {
  // tslint:disable-next-line: no-input-rename
  @Input('cardMask') cardMask = '(000)-000-0000';
  // tslint:disable-next-line: no-input-rename
  @Input('formControl') formControl!: UntypedFormControl;
  // tslint:disable-next-line: no-input-rename
  @Input('formControlName') formControlName!: string;
  // tslint:disable-next-line: no-input-rename
  @Input('placeholder') placeholder = '(XXX)-XXX-XXXX';

  // tslint:disable-next-line: no-input-rename
  @Input('fieldId') fieldId!: string;

  @Input() isSubmit = true;

  @Output() saveValue = new EventEmitter();
  @Output() stateChange = new EventEmitter();

  @ViewChild(FormControlDirective, { static: true }) formControlDirective!: FormControlDirective;
  @ViewChild('intElm', { static: true }) intElm!: ElementRef;

  public value!: number;
  private disabled!: boolean;

  get control() {
    return (
      this.formControl || (this.controlContainer.control && this.controlContainer.control.get(this.formControlName))
    );
  }

  set control(ctrl) {}

  constructor(private controlContainer: ControlContainer, private readonly changeDetectorRef: ChangeDetectorRef) {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (
      control.value &&
      control.value !== undefined &&
      control.value.trim() !== '' &&
      isAllCharactersSame(control.value)
    ) {
      return { phoneInValid: true };
    }

    return null;
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.control =
        this.formControl || (this.controlContainer.control && this.controlContainer.control.get(this.formControlName));
    }, 0);

    this.changeDetectorRef.detectChanges();
  }

  registerOnTouched(fn: any): void {
    if (this.formControlDirective.valueAccessor) {
      this.formControlDirective.valueAccessor.registerOnTouched(fn);
    }
  }

  registerOnChange(fn: any): void {
    if (this.formControlDirective.valueAccessor) {
      this.formControlDirective.valueAccessor.registerOnChange(fn);
    }
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (this.formControlDirective.valueAccessor) {
      this.formControlDirective.valueAccessor.writeValue(obj);
    }
  }

  onChange(e: any) {
    this.value = e.target.value;
    this.saveValue.emit(e.target.value);
  }

  onTouched() {
    this.stateChange.emit();
  }

  saveValueAction(e: any) {
    this.saveValue.emit(e.target.value);
  }

  /**
   * call this from parent component to set cursor
   */
  doFocus() {
    this.intElm.nativeElement.focus();
  }
}
