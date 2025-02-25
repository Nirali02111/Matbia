import {
  Input,
  OnInit,
  Output,
  Provider,
  ViewChild,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  AfterContentInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  UntypedFormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

const ACCOUNT_NUMBER_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => AccountNumberInputComponent),
  multi: true,
};

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-account-number-input',
  template: `
    <input
      class="form-control"
      [class.is-invalid]="control?.touched && control?.invalid"
      appBlockCutCopyPaste
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
  providers: [ACCOUNT_NUMBER_CONTROL_VALUE_ACCESSOR],
  imports: [SharedModule, InputErrorComponent],
})
export class AccountNumberInputComponent implements OnInit, ControlValueAccessor, AfterContentInit {
  // tslint:disable-next-line: no-input-rename
  @Input('cardMask') cardMask = '00000999999999999999';

  @Input() placeholder = 'Account Number';

  // tslint:disable-next-line: no-input-rename
  @Input('formControl') formControl!: UntypedFormControl;
  // tslint:disable-next-line: no-input-rename
  @Input('formControlName') formControlName!: string;

  @Input() isSubmit = true;

  @Output() saveValue = new EventEmitter();
  @Output() stateChange = new EventEmitter();

  @ViewChild(FormControlDirective, { static: true }) formControlDirective!: FormControlDirective;
  @ViewChild('intElm', { static: true }) intElm!: ElementRef;

  private value!: string;

  constructor(private controlContainer: ControlContainer, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {}

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
