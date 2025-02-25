import { Directive, HostBinding } from '@angular/core';

/**
 * For Amount Input Field on Mobile use Numeric Keypad
 *
 * inputmode decimal work for latest versions but for older version use pattern attribute
 *
 */

@Directive({
  selector: '[appAmountKeypad]',
})
export class AmountKeypadDirective {
  /**
   *
   */
  @HostBinding('attr.type') get type() {
    return 'text';
  }

  /**
   *
   */
  @HostBinding('attr.pattern') get pattern() {
    return /^[0-9]+(.[0-9]{0,2})?$/;
  }

  /**
   *
   */
  @HostBinding('attr.inputmode') get inputmode() {
    return 'decimal';
  }

  constructor() {}
}
