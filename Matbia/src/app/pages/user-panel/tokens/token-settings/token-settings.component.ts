import { Component, Input, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonDataService } from '@commons/common-data-service.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingAPIObj, SettingAPIService } from '@services/API/setting-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-token-settings',
  imports: [SharedModule, MatbiaSkeletonLoaderComponentComponent],
  templateUrl: './token-settings.component.html',
  styleUrl: './token-settings.component.scss',
})
export class TokenSettingsComponent {
  form!: FormGroup;
  isLoading: boolean = true;

  @Input() mode: 'popup' | 'regular' = 'regular';
  isSettingSet: boolean = true;

  get SettingField() {
    return this.form.get('setting');
  }

  tokenSettingsList!: SettingAPIObj;
  constructor(
    private fb: FormBuilder,
    private setting: SettingAPIService,
    private notification: NotificationService,
    private localStorageService: LocalStorageDataService,
    @Optional() private activeModal: NgbActiveModal,
    private pageRoute: PageRouteVariable,
    private matbiaObserver: MatbiaObserverService,
    private router: Router,
    public commonDataService: CommonDataService
  ) {}
  ngOnInit() {
    this.form = this.fb.group({
      setting: this.fb.control('Token Request'),
    });
    this.getEntitySetting();
    this.matbiaObserver.isEnitityId$.subscribe((res) => {
      if (!res) {
        this.isSettingSet = false;
      }
    });
  }

  closePopup() {
    if (this.activeModal) this.activeModal.dismiss();
  }

  getEntitySetting() {
    this.isLoading = true;
    this.setting.getExpiredTokenSetting().subscribe(
      (res) => {
        if (!res) {
          return;
        }
        this.isLoading = false;
        this.tokenSettingsList = res;
        this.SettingField?.patchValue(res.settingValue);

        this.SettingField?.updateValueAndValidity();
        this.form.updateValueAndValidity();
      },
      (err) => {
        console.log(err, 'err');
        this.isLoading = false;
      }
    );
  }

  saveTokenSetting() {
    if (this.mode === 'popup') this.closePopup();

    this.notification.initLoadingPopup();
    this.localStorageService.setSettingsToken(this.SettingField?.value);
    this.setting
      .saveTokenExpSettings({
        settingId: this.tokenSettingsList.settingID,
        text: this.SettingField?.value,
      })
      .subscribe(
        () => {
          this.notification.hideLoader();
          const isEntityId = this.commonDataService.isEntityId();
          if (!isEntityId) {
            this.router.navigate(this.pageRoute.getTokenListRouterLink());
          }

          this.matbiaObserver.setIsEntityId(true);
          this.notification.displaySuccess('Your setting was saved successfully');
        },
        () => {
          this.notification.hideLoader();
        }
      );
  }

  getTokenListRouterLink() {
    return this.pageRoute.getTokenListRouterLink();
  }

  continue() {
    this.isSettingSet = true;
  }
}
