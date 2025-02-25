import { Directive, HostBinding, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appIsHebrew]',
})
export class IsHebrewDirective implements OnInit {
  @HostBinding('class.lbl-hebrew') get valid() {
    return this.check();
  }
  // tslint:disable-next-line: no-input-rename
  @Input('content') content!: string;
  constructor() {}

  ngOnInit(): void {}

  check(): boolean {
    if (this.content) {
      return /[\u0590-\u05FF]/.test(this.content);
    }

    return false;
  }
}
