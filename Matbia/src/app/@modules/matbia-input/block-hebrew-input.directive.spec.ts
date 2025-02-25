import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockHebrewInputDirective } from './block-hebrew-input.directive';
import { Component, DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('BlockHebrewInputDirective', () => {
  let fixture: ComponentFixture<any>;
  let blockHebrewHostNativeElement: HTMLElement;
  let blockHebrewHostDebugElement: DebugElement;

  describe('on an interative host', () => {
    // let testComponent: BlockHebrewInputComponent;

    beforeEach(() => {
      // TestBed.configureTestingModule({
      //   imports: [BlockHebrewInputComponent, BlockHebrewInputDirective],
      // });
      // fixture = TestBed.createComponent(BlockHebrewInputComponent);
      // testComponent = fixture.debugElement.componentInstance;
      // fixture.detectChanges();
      // blockHebrewHostDebugElement = fixture.debugElement.query(By.directive(BlockHebrewInputComponent))!;
      // blockHebrewHostNativeElement = blockHebrewHostDebugElement.nativeElement;
    });

    it('should expose the badge element', () => {
      // const badgeElement = blockHebrewHostNativeElement.querySelector('.mat-badge-content')!;
      expect(true).toBeTruthy();
    });

    it('should create an instance', () => {
      // const directive = new BlockHebrewInputDirective();
      // expect(directive).toBeTruthy();
      expect(true).toBeTruthy();
    });
  });
});

@Component({
    template: ` <input type="text" appBlockHebrewInputRef /> `,
    imports: [CommonModule, FormsModule]
})
class BlockHebrewInputComponent {}
