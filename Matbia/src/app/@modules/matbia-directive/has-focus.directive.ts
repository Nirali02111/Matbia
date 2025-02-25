import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appHasFocus]',
})
export class HasFocusDirective {
  constructor(private elementHost: ElementRef) {}

  @HostListener('focusin')
  setInputFocus(): void {
    this.elementHost.nativeElement.classList.add('has-focus');
  }

  @HostListener('focusout')
  setInputFocusOut(): void {
    this.elementHost.nativeElement.classList.remove('has-focus');
  }
}

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocusDirective implements OnInit, AfterViewInit {
  constructor(private elementRef: ElementRef, private readonly $cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // setTimeout(() => {});
    // this.elementRef.nativeElement.focus();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.doFocus();
    });
  }

  doFocus() {
    this.elementRef.nativeElement.focus();
    this.$cdr.detectChanges();
  }
}
