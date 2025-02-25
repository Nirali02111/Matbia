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

const CREDIT_CARD_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => CreditCardInputComponent),
  multi: true,
};

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-credit-card-input',
  template: `
    <input
      class="form-control"
      appCardKeypad
      [validation]="true"
      [mask]="cardMask"
      [formControl]="control"
      (input)="onChange($event)"
      (blur)="onTouched()"
      (change)="saveValueAction($event)"
      [placeholder]="cardMask"
      #intElm
    />

    <ng-container *ngIf="control?.touched && control?.invalid && isSubmit">
      <app-input-error [errors]="control?.errors"></app-input-error>
    </ng-container>
  `,
  providers: [CREDIT_CARD_CONTROL_VALUE_ACCESSOR],
  imports: [SharedModule, InputErrorComponent],
})
export class CreditCardInputComponent implements ControlValueAccessor, AfterContentInit {
  protected sixTeenMask = '0000-0000-0000-0000';
  protected fifTeenMask = '0000-0000-0000-000';
  protected amexMask = '0000-000000-00000';

  // tslint:disable-next-line: no-input-rename
  @Input('cardMask') cardMask = '0000-0000-0000-0000';

  // tslint:disable-next-line: no-input-rename
  @Input('formControl') formControl!: UntypedFormControl;
  // tslint:disable-next-line: no-input-rename
  @Input('formControlName') formControlName!: string;

  @Input() isSubmit = true;

  @Output() saveValue = new EventEmitter();
  @Output() stateChange = new EventEmitter();
  @Output() cardComplete = new EventEmitter();
  @ViewChild(FormControlDirective, { static: true }) formControlDirective!: FormControlDirective;
  @ViewChild('intElm', { static: true }) intElm!: ElementRef;

  private value!: string;

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

  set control(_ctrl) {}

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

  writeValue(obj: any): void {
    if (this.formControlDirective.valueAccessor) {
      this.formControlDirective.valueAccessor.writeValue(obj);
    }
  }

  onChange(e: any) {
    this.value = e.target.value;
    this.saveValue.emit(e.target.value);

    const twoDigit = this.value.substring(0, 2);
    if (twoDigit === '34' || twoDigit === '37') {
      this.cardMask = this.amexMask;
    } else {
      this.cardMask = this.sixTeenMask;
    }
    const cardValue = this.value.replace(/-/g, '');
    const maxLength = twoDigit === '34' || twoDigit === '37' ? 15 : 16;
    if (cardValue.length === maxLength) {
      this.cardComplete.emit();
    }
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
