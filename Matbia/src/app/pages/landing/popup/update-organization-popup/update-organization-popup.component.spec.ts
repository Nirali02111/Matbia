import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOrganizationPopupComponent } from './update-organization-popup.component';

describe('UpdateOrganizationPopupComponent', () => {
  let component: UpdateOrganizationPopupComponent;
  let fixture: ComponentFixture<UpdateOrganizationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOrganizationPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOrganizationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
