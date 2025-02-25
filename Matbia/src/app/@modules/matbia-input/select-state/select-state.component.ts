import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
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
} from '@angular/forms';
import { CommonDataService } from '@commons/common-data-service.service';

const SELECT_STATE_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => SelectStateComponent),
  multi: true,
};

import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-select-state',
  template: `
    <select
      class="form-control form-select"
      [ngClass]="otherClass"
      [formControl]="control"
      (blur)="onTouched()"
      (change)="saveValueAction($event)"
    >
      <option *ngFor="let x of commonDataService.stateList" [value]="x.item_id">
        {{ x.item_text }}
      </option>
    </select>

    <ng-container *ngIf="control?.touched && control?.invalid && isSubmit">
      <app-input-error [errors]="control?.errors"></app-input-error>
    </ng-container>
  `,
  providers: [SELECT_STATE_CONTROL_VALUE_ACCESSOR],
  imports: [SharedModule, InputErrorComponent],
})
export class SelectStateComponent implements OnInit, ControlValueAccessor, AfterContentInit {
  // tslint:disable-next-line: no-input-rename
  @Input('stateList') stateList: Array<{ item_id: number; item_text: string }> = [];

  // tslint:disable-next-line: no-input-rename
  @Input('formControl') formControl!: UntypedFormControl;
  // tslint:disable-next-line: no-input-rename
  @Input('formControlName') formControlName!: string;

  // tslint:disable-next-line: no-input-rename
  @Input('classList') otherClass = '';

  @Input() isSubmit = true;

  @Output() saveValue = new EventEmitter();
  @Output() stateChange = new EventEmitter();

  @ViewChild(FormControlDirective, { static: true }) formControlDirective!: FormControlDirective;

  // stateList!: Array<{ item_id: number; item_text: string }>;

  public value!: number;
  private disabled!: boolean;

  constructor(
    public commonDataService: CommonDataService,
    private controlContainer: ControlContainer,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}
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
}
