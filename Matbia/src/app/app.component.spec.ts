import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { ActivatedRoute, UrlHandlingStrategy } from '@angular/router';

import { DebugElement, importProvidersFrom } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { MatbiaUrlHandlingStrategy } from '@commons/matbia-url-handling-strategy';

import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let app: AppComponent;
  let de: DebugElement;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        importProvidersFrom(FormsModule, NgbModule, ToastrModule.forRoot()),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: new BehaviorSubject<{}>({}),
          },
        },
        { provide: UrlHandlingStrategy, useClass: MatbiaUrlHandlingStrategy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    de = fixture.debugElement;
  });

  it('should create the app', () => {
    expect(app).toBeDefined();
  });

  it(`should have as title 'MatbiaAngular'`, () => {
    fixture.detectChanges();
    expect(app.isHeaderMenuVisible).toBeFalsy();
    expect(app.isSideMenuVisible).toBeFalsy();
  });
});
