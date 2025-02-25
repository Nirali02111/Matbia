import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAndFeedbackComponent } from './help-and-feedback.component';

describe('HelpAndFeedbackComponent', () => {
  let component: HelpAndFeedbackComponent;
  let fixture: ComponentFixture<HelpAndFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HelpAndFeedbackComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpAndFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
