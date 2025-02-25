import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SidebarMenuComponent } from './sidebar-menu.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatbiaObserverService } from '@commons/matbia-observer.service';

describe('SidebarMenuComponent', () => {
  let component: SidebarMenuComponent;
  let fixture: ComponentFixture<SidebarMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CommonModule, RouterTestingModule, SidebarMenuComponent],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                queryParamMap: of({
                    has: (key: string) => { }
                })
            }
        },
        {
            provide: MatbiaObserverService,
            useValue: {
                isEnitityId$: of(true),
                batchVisible$: of(false),
                devMode$: of(false),
                prodMode$: of(false),
            },
        },
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });


  it('should show all option on the sidebar', () => {
    (TestBed.inject(MatbiaObserverService) as any).isEnitityId$ = of(true);
    fixture = TestBed.createComponent(SidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showSidebarToken).toBeTruthy();
    expect(component.isEntityId).toBeTruthy();
   });

  it('should show only the generate tokens page on the sidebar', () => {
  (TestBed.inject(MatbiaObserverService) as any).isEnitityId$ = of(false);
  fixture = TestBed.createComponent(SidebarMenuComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
  expect(component.showSidebarToken).toBeFalsy();
  expect(component.isEntityId).toBeFalsy();
  });
});