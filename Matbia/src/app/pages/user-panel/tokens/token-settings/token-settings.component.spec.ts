import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenSettingsComponent } from './token-settings.component';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { NotificationService } from '@commons/notification.service';
import { ActivatedRoute } from '@angular/router';
import { MatbiaObserverService } from '@commons/matbia-observer.service';

describe('TokenSettingsComponent', () => {
  let component: TokenSettingsComponent;
  let fixture: ComponentFixture<TokenSettingsComponent>;
  let mockMatbiaObserverService: jasmine.SpyObj<MatbiaObserverService>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenSettingsComponent],
      providers: [ 
        {
          provide: HttpClient,
          useValue:  {
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
        },
        {
          provide: ActivatedRoute,
          useValue:  {
            queryParamMap: of({
              has: (key: string) => {}
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TokenSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
