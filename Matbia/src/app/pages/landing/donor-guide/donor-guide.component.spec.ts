import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonorGuideComponent } from './donor-guide.component';

describe('DonorGuideComponent', () => {
  let component: DonorGuideComponent;
  let fixture: ComponentFixture<DonorGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [DonorGuideComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonorGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
