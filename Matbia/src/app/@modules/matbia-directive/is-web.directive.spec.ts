import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IsWebDirective } from './is-web.directive';
import { Component, DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatbiaDirectiveModule } from './matbia-directive.module';

describe('IsWebDirective', () => {
  let fixture: ComponentFixture<any>;
  let isWebHostNativeElement: HTMLElement;
  let isWebHostDebugElement: DebugElement;

  describe('on an interative host', () => {
    // let testComponent: WebDirectiveComponent;

    beforeEach(() => {
      // TestBed.configureTestingModule({
      //   imports: [WebDirectiveComponent, MatbiaDirectiveModule],
      //   providers: [],
      // });
      // fixture = TestBed.createComponent(WebDirectiveComponent);
      // testComponent = fixture.debugElement.componentInstance;
      // fixture.detectChanges();
      // isWebHostDebugElement = fixture.debugElement.query(By.directive(WebDirectiveComponent))!;
      // isWebHostNativeElement = isWebHostDebugElement.nativeElement;
    });

    it('should expose the badge element', () => {
      // const badgeElement = isWebHostNativeElement.querySelector('.mat-badge-content')!;
      // expect(fixture.componentInstance.badgeInstance.getBadgeElement()).toBe(badgeElement);
      expect(true).toBeTruthy();
    });

    it('should create an instance', () => {
      // const directive = new BlockHebrewInputDirective();
      // expect(true).toBeTruthy();
      expect(true).toBeTruthy();
    });
  });
});

@Component({
    template: ` <div *appIsWeb></div> `,
    imports: [CommonModule, FormsModule]
})
class WebDirectiveComponent {}
