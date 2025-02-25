import { Directive, HostBinding, Input } from '@angular/core';

/**
 * For Card Number Input Field on Mobile use Numeric Keypad
 *
 * inputmode decimal work for latest versions but for older version use pattern attribute
 *
 */

@Directive({
  selector: '[appCardKeypad]',
})
export class CardKeypadDirective {
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
    return /^[0-9]*/;
  }

  /**
   *
   */
  @HostBinding('attr.inputmode') get inputmode() {
    return 'decimal';
  }

  constructor() {}
}
