import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { LandingModuleService } from '../landing-module.service';
import { UserApiService } from '@services/API/user-api.service';
import { Params } from '@enum/Params';

// class NavigationEnd {
//   url: string;
//   constructor(url: string) {
//     this.url = url;
//   }
// }

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let de: DebugElement;
  let fixture: ComponentFixture<LayoutComponent>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [CommonModule, LayoutComponent],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                firstChild: {
                    routeConfig: {
                        path: '',
                    },
                },
                queryParamMap: of({
                    get: (key: string) => { },
                }),
            },
        },
        {
            provide: Router,
            useValue: {
                events: of({}),
            },
        },
        {
            provide: LandingModuleService,
            useValue: {
                queryParamMap: of({}),
            },
        },
        {
            provide: UserApiService,
            useValue: {
                queryParamMap: of({}),
            },
        },
    ],
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    router = TestBed.inject(Router);
  });

  it('should create the LayoutComponent', () => {
    expect(component).toBeDefined();
  });

  describe('Header visible', () => {
    it('should visible for signup-card', () => {
      (TestBed.inject(Router) as any).events = of(new NavigationEnd(0, 'signup-card', ''));
      fixture = TestBed.createComponent(LayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.isHideHeder).toBeTruthy();
    });

    it('should visible for send-me-card', () => {
      (TestBed.inject(Router) as any).events = of(new NavigationEnd(0, 'send-me-card', ''));
      fixture = TestBed.createComponent(LayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.isHideHeder).toBeTruthy();
    });

    it('should visible for organization donation', () => {
      (TestBed.inject(Router) as any).events = of(new NavigationEnd(0, '/d/001242', ''));
      fixture = TestBed.createComponent(LayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.isHideHeder).toBeTruthy();
      expect(component.isPlainHeader).toBeTruthy();
    });
  });

  it('should check Header Hide', () => {
    fixture.detectChanges();
    expect(component.isHideHeder).toBeFalsy();
  });

  describe('without Shulkiosk', () => {
    it(`should without Shulkiosk Parameter`, () => {
      fixture.detectChanges();
      expect(component.isShulkiosk).toBeFalsy();
    });
  });

  describe('with Shulkiosk', () => {
    beforeEach(() => {
      (TestBed.inject(ActivatedRoute) as any).queryParamMap = of({
        get: (key: string) => {
          switch (key) {
            case Params.SHUL_KIOSK:
              return 'true';
            case Params.ACTIVE_STEP:
              return null;
            default:
              return null;
          }
        },
      });
    });

    it(`should with Shulkiosk Parameter`, () => {
      fixture.detectChanges();
      component.ngOnInit();
      expect(component.isShulkiosk).toBeTruthy();
    });
  });
});
