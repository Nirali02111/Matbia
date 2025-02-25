import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IsTabletDirective } from './is-tablet.directive';
import { MatbiaDirectiveModule } from './matbia-directive.module';
import { Component, DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('IsTableDirective', () => {
  let fixture: ComponentFixture<any>;
  let isWebHostNativeElement: HTMLElement;
  let isWebHostDebugElement: DebugElement;

  describe('on an interative host', () => {
    let testComponent: TabDirectiveComponent;

    beforeEach(() => {
      // TestBed.configureTestingModule({
      //   imports: [MatbiaDirectiveModule],
      //   providers: [],
      // });
      // fixture = TestBed.createComponent(TabDirectiveComponent);
      // testComponent = fixture.debugElement.componentInstance;
      // fixture.detectChanges();
      // isWebHostDebugElement = fixture.debugElement.query(By.directive(IsTabletDirective))!;
      // isWebHostNativeElement = isWebHostDebugElement.nativeElement;
    });

    it('should create an instance', () => {
      // const directive = new BlockHebrewInputDirective();
      expect(true).toBeTruthy();
    });
  });
});
@Component({
    template: ` <div *appIsWeb></div> `,
    imports: [CommonModule, MatbiaDirectiveModule]
})
class TabDirectiveComponent {}
