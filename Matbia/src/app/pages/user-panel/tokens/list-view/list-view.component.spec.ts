import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewComponent } from './list-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '@commons/notification.service';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';
import { DonorTokenAPIService, TokenResponse } from '@services/API/donor-token-api.service';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let donorTokenAPI: DonorTokenAPIService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ListViewComponent],
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
            provide: PanelPopupsService,
            useValue: {
                openTokenSettingsPopup: (obj: any) => { }
            }
        },
        {
            provide: HttpClient,
            useValue: {
                get: () => of({}),
                post: () => of({}),
                put: () => of({}),
            }
        },
        {
            provide: NotificationService,
            useValue: {
                throwError: jasmine.createSpy('throwError'), // Mock throwError method
            },
        }, {
            provide: SearchPipe,
            useValue: {
                transform: () => { }
            }
        }
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ListViewComponent);
    
    component = fixture.componentInstance;
    donorTokenAPI = TestBed.inject(DonorTokenAPIService);

    fixture.detectChanges();
  });

  it('should set todisplayNoTokenPage to true when res.tokens is null', () => {
    const mockResponse: TokenResponse = {
      tokens:null,
      totalAmount: 0,
      totalGenerated: 0,
      totalProcessed: 0,
    };

    spyOn(donorTokenAPI, 'getTokens').and.returnValue(of(mockResponse));
    component = fixture.componentInstance;
    expect(component.todisplayNoTokenPage).toBeTrue();
  });


});
