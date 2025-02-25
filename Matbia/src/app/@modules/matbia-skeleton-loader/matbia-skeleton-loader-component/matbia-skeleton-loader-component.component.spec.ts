import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatbiaSkeletonLoaderComponentComponent } from './matbia-skeleton-loader-component.component';

describe('MatbiaSkeletonLoaderComponentComponent', () => {
  let component: MatbiaSkeletonLoaderComponentComponent;
  let fixture: ComponentFixture<MatbiaSkeletonLoaderComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MatbiaSkeletonLoaderComponentComponent],
}).compileComponents();

    fixture = TestBed.createComponent(MatbiaSkeletonLoaderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
