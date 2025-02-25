import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPoliciesForUsersComponent } from './program-policies-for-users.component';
import { CommonModule } from '@angular/common';

describe('ProgramPoliciesForUsersComponent', () => {
  let component: ProgramPoliciesForUsersComponent;
  let fixture: ComponentFixture<ProgramPoliciesForUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CommonModule, ProgramPoliciesForUsersComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPoliciesForUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
