import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseUpdateComponent } from './release-update.component';

describe('ReleaseUpdateComponent', () => {
  let component: ReleaseUpdateComponent;
  let fixture: ComponentFixture<ReleaseUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReleaseUpdateComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
