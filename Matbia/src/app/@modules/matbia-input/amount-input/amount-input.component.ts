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
  ControlContainer,
  ControlValueAccessor,
  UntypedFormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonDataService } from '@commons/common-data-service.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const AMOUNT_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => AmountInputComponent),
  multi: true,
};

const AMOUNT_CONTROL_VALIDATORS_ACCESSOR: Provider = {
  provide: NG_VALIDATORS,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => AmountInputComponent),
  multi: true,
};

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-amount-input',
  template: `
    <input
      class="form-control"
      [ngClass]="otherClass"
      type="text"
      appAmountKeypad
      [validation]="true"
      mask="separator.2"
      thousandSeparator=","
      [separatorLimit]="separatorLimit"
      [formControl]="control"
      (focusout)="onAmountAdd($event)"
      (input)="onChange($event)"
      (blur)="onTouched()"
      (change)="saveValueAction($event)"
      [placeholder]="placeholder"
      #intElm
      [readonly]="!isSelected"
    />

    <ng-container *ngIf="control?.touched && control?.invalid && isSubmit">
      <app-input-error [errors]="control?.errors"></app-input-error>
    </ng-container>
  `,
  styles: [':host { width: 100%; }'],
  providers: [AMOUNT_CONTROL_VALUE_ACCESSOR, AMOUNT_CONTROL_VALIDATORS_ACCESSOR],
  imports: [SharedModule, InputErrorComponent],
})
export class AmountInputComponent implements OnInit, ControlValueAccessor, AfterContentInit, Validator {
  // tslint:disable-next-line: no-input-rename
  @Input('placeholder') placeholder = '$0.00';
  // tslint:disable-next-line: no-input-rename
  @Input('formControl') formControl!: UntypedFormControl;

  // Limit max length
  // tslint:disable-next-line: no-input-rename
  @Input('separatorLimit') separatorLimit = '10000';

  // tslint:disable-next-line: no-input-rename
  @Input('formControlName') formControlName!: string;

  // tslint:disable-next-line: no-input-rename
  @Input('class') otherClass = '';

  @Input() isSubmit = true;

  @Input() outputFormat = true;

  @Input() isSelected: boolean = true;

  @Input() isSwitchOn: any;

  @Output() saveValue = new EventEmitter();
  @Output() stateChange = new EventEmitter();

  @ViewChild(FormControlDirective, { static: true }) formControlDirective!: FormControlDirective;
  @ViewChild('intElm', { static: true }) intElm!: ElementRef;

  private value!: string;
  private disabled!: boolean;

  public formatAmt$ = new Subject<string>();

  constructor(
    private controlContainer: ControlContainer,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private commonDataService: CommonDataService
  ) {}

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }

  ngOnInit(): void {
    if (!this.outputFormat) {
      return;
    }

    this.formatAmt$.pipe(debounceTime(300)).subscribe((term: any) => {
      if (term !== '') {
        const toFix = this.commonDataService.getNumberWithFormate(term);
        this.value = toFix;
        this.saveValue.emit(toFix);
        this.control.setValue(toFix, { emitEvent: true });
      }
    });
  }

  ngOnChanges() {
    if (this.isSwitchOn != undefined) {
      if (this.isSwitchOn) {
        this.control.enable();
      } else {
        this.control.disable();
      }
    }
  }

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

  doFocusout() {
    this.intElm.nativeElement.blur();
  }

  onAmountAdd(event: any) {
    if (!this.outputFormat) {
      return;
    }

    this.doFormatAmt((event.target as HTMLInputElement).value);
  }

  doFormatAmt(value: string | undefined) {
    this.formatAmt$.next(value || '');
  }
}
