import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider,
  ViewChild,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  UntypedFormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

const CARD_EXP_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => CardExpiryInputComponent),
  multi: true,
};

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-card-expiry-input',
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
      #expiryInput
      #intElm
    />

    <ng-container *ngIf="control?.touched && control?.invalid && isSubmit">
      <app-input-error [errors]="control?.errors"></app-input-error>
    </ng-container>
  `,
  providers: [CARD_EXP_CONTROL_VALUE_ACCESSOR],
  imports: [SharedModule, InputErrorComponent],
})
export class CardExpiryInputComponent implements ControlValueAccessor, AfterContentInit {
  // tslint:disable-next-line: no-input-rename
  @Input('cardMask') cardMask = '00/00';
  // tslint:disable-next-line: no-input-rename
  @Input('placeholder') placeholder = 'MM/YY';
  // tslint:disable-next-line: no-input-rename
  @Input('formControl') formControl!: UntypedFormControl;
  // tslint:disable-next-line: no-input-rename
  @Input('formControlName') formControlName!: string;
  @Output() saveValue = new EventEmitter();
  @Output() stateChange = new EventEmitter();

  @Input() isSubmit = true;

  @ViewChild(FormControlDirective, { static: true }) formControlDirective!: FormControlDirective;
  @ViewChild('intElm', { static: true }) intElm!: ElementRef;

  @ViewChild('expiryInput', { static: true }) expiryInput!: ElementRef<HTMLInputElement>;

  private value!: string;
  private disabled!: boolean;

  constructor(private controlContainer: ControlContainer, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.control =
        this.formControl || (this.controlContainer.control && this.controlContainer.control.get(this.formControlName));
    }, 0);

    this.changeDetectorRef.detectChanges();
  }

  get control() {
    return (
      this.formControl || (this.controlContainer.control && this.controlContainer.control.get(this.formControlName))
    );
  }

  set control(ctrl) {}

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

  focus() {
    this.expiryInput.nativeElement.focus(); // Set focus on expiry date input
  }
}
