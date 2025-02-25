import {
  AfterContentInit,
  ElementRef,
  forwardRef,
  OnInit,
  Provider,
  Directive,
  Renderer2,
  Injector,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

const BLOCK_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => BlockHebrewInputDirective),
  multi: true,
};

@Directive({
  selector: '[appBlockHebrewInputRef]',
  host: {
    '(input)': 'handleInput($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [BLOCK_CONTROL_VALUE_ACCESSOR],
})
export class BlockHebrewInputDirective implements OnInit, ControlValueAccessor, AfterContentInit {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef, private _inj: Injector) {}

  ngOnInit(): void {}
  ngAfterContentInit(): void {}

  writeValue(value: any): void {
    const normalizedValue = value == null ? '' : value;
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  handleInput(value: any): void {
    const newVal = value.replace(/[\u0590-\u05FF]/gi, '');
    let model = this._inj.get(NgControl);
    if (newVal === model.control?.value) {
      model.control?.setValue(model.value);
      // return;
    }
    this.onChange(newVal);
  }
}
