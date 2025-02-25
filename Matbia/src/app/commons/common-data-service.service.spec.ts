import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

import { CommonDataService } from './common-data-service.service';
import { LocalStorageDataService } from './local-storage-data.service';
import { MatbiaObserverService } from './matbia-observer.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CommonDataService', () => {
  let service: CommonDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        {
          provide: LocalStorageDataService,
          useValue: {
            getEntityTokenSetting: () => {}          
          }
        },
        {
          provide: MatbiaObserverService,
          useValue: {
            shulKiousk$: of({}),
            blockBankManagement$: of({}),
            blockPlaid$: of({}),
            isEntityId$: of({}),
            isBatchVisible$: of({}),
            isDevMode$: of({}),      
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({}),     
          }
        }
      ]
    });
    service = TestBed.inject(CommonDataService);
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
});
