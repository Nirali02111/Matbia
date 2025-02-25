import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { ThemeService } from 'src/app/@theme/theme.service';
import { of } from 'rxjs';
import { PanelPopupsService } from '../popups/panel-popups.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [DashboardComponent],
    providers: [
        {
            provide: LocalStorageDataService,
            useValue: {
                isDonor: () => true,
                isBusinessDonor: () => false,
                isBusiness: () => false,
                isOrganization: () => false,
                getEntitySetting: () => { },
                getLoginUserUserName: () => { },
                setEntityTokenSetting: (data: any) => { },
                getEntityTokenSetting: () => { }
            }
        },
        {
            provide: ThemeService,
            useValue: {
                searchInMatbiaObservable: of({})
            }
        }, {
            provide: PanelPopupsService,
            useValue: {
                openTokenSettingsPopup: (obj: any) => { }
            }
        }, {
            provide: ActivatedRoute,
            useValue: {
                queryParamMap: of({
                    has: (key: string) => { }
                })
            }
        }, {
            provide: HttpClient,
            useValue: {
                get: () => of({}),
                post: () => of({}),
                put: () => of({}),
            }
        }
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });


  describe('should check with Token Exp parameter', () => {
    beforeEach(() => {
      (TestBed.inject(ActivatedRoute) as any ).queryParamMap = of({
        has: (key: string) => {
          return true
        }
      })
    });

    it('should check Token Exp parameter', () => {
      const d = spyOn(component, 'openTokenSetting')
       component.ngOnInit();
       fixture.detectChanges();
       expect(d).toHaveBeenCalled()
     });
  });


  describe('should check without Token Exp parameter', () => {
    beforeEach(() => {
      (TestBed.inject(ActivatedRoute) as any ).queryParamMap = of({
        has: (key: string) => {
          return false
        }
      })
    });

    it('should check Token Exp parameter not exist', () => {
     const d = spyOn(component, 'openTokenSetting')
     
      component.ngOnInit();
      fixture.detectChanges();
      expect(d).not.toHaveBeenCalled()
    });
  });

  
});
