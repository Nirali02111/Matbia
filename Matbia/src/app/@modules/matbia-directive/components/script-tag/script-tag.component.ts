import { Component, Input, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-script-tag',
  template: `<div #script [style.display]="'none'">
    <ng-content></ng-content>
  </div>`,
  imports: [SharedModule],
})
export class ScriptTagComponent implements AfterViewInit {
  @Input() src!: string;

  @Input() type!: string;

  @Input() defer!: boolean;

  @ViewChild('script') script!: ElementRef;

  constructor(private ngZone: NgZone) {}

  convertToScript() {
    this.ngZone.runOutsideAngular(() => {
      var element = this.script.nativeElement;
      var script = document.createElement('script');
      script.type = this.type ? this.type : 'text/javascript';
      if (this.src) {
        script.src = this.src;
      }

      if (this.defer) {
        script.defer = this.defer;
      }

      if (element.innerHTML) {
        script.innerHTML = element.innerHTML;
      }
      var parent = element.parentElement;
      parent.parentElement.replaceChild(script, parent);
    });
  }

  ngAfterViewInit() {
    this.convertToScript();
  }
}
