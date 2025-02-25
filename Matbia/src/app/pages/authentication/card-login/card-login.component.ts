import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '@enum/Params';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgOtpInputComponent } from 'ng-otp-input';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AuthService } from '@services/API/auth.service';
import { SettingAPIService } from '@services/API/setting-api.service';
import { environment } from 'src/environments/environment';
import { LandingModuleService } from '../../landing/landing-module.service';
const CARD_ID = 'card';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-card-login',
  templateUrl: './card-login.component.html',
  styleUrls: ['./card-login.component.scss'],
  imports: [SharedModule],
})
export class CardLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  cardLoginForm!: UntypedFormGroup;

  public returnUrl = '/';
  public dashboardUrl = '/';

  public pinConfig = {
    length: 4,
    inputClass: 'otp-input-password',
    allowNumbersOnly: true,
    disableAutoFocus: true,
  };

  get cardId() {
    return this.cardLoginForm.get('cardId');
  }

  get PIN() {
    return this.cardLoginForm.get('pin');
  }

  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput!: NgOtpInputComponent;

  constructor(
    private fb: UntypedFormBuilder,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private authService: AuthService,
    private localStorageDataService: LocalStorageDataService,
    private notificationService: NotificationService,
    private landingModuleService: LandingModuleService,
    private settingAPI: SettingAPIService,
    private readonly $cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardUrl = this.landingModuleService.DashboardUrlString;

    this.cardLoginForm = this.fb.group({
      cardId: this.fb.control('', Validators.compose([Validators.required])),
      pin: this.fb.control('', Validators.compose([Validators.required, Validators.minLength(4)])),
    });

    this.activeRoute.paramMap.subscribe((params) => {
      const identity = params.get(CARD_ID);
      if (identity) {
        this.cardLoginForm.patchValue({
          cardId: identity,
        });
      }
    });

    this.activeRoute.queryParamMap.subscribe((params) => {
      const hasReturnValue = params.get('returnUrl');
      const hasShulKiosk = params.get(Params.SHUL_KIOSK);

      if (hasReturnValue) {
        this.returnUrl = hasReturnValue;
      }

      if (hasShulKiosk) {
        this.dashboardUrl = this.landingModuleService.DashboardWithShulKioskString;
      }

      if (params.has(Params.BLOCK_BANK_MANAGEMENT)) {
        const hasBlockManagement = params.get(Params.BLOCK_BANK_MANAGEMENT);
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${Params.BLOCK_BANK_MANAGEMENT}=${hasBlockManagement}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${Params.BLOCK_BANK_MANAGEMENT}=${hasBlockManagement}`;
        }
      }

      if (params.has(Params.BLOCK_PLAID)) {
        const hasBlockPlaid = params.get(Params.BLOCK_PLAID);
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${Params.BLOCK_PLAID}=${hasBlockPlaid}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${Params.BLOCK_PLAID}=${hasBlockPlaid}`;
        }
      }

      if (
        (params.has(Params.UTM_CAMPAIGN) ||
          params.has(Params.UTM_MEDIUM) ||
          params.has(Params.UTM_SOURCE) ||
          params.has(Params.UTM_ID)) &&
        environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER
      ) {
        const utm_c = params.get(Params.UTM_CAMPAIGN);
        const utm_m = params.get(Params.UTM_MEDIUM);
        const utm_s = params.get(Params.UTM_SOURCE);
        const utm_id = params.get(Params.UTM_ID);
        const utnQuery = `${Params.UTM_CAMPAIGN}=${utm_c}&${Params.UTM_MEDIUM}=${utm_m}&${Params.UTM_SOURCE}=${utm_s}&${Params.UTM_ID}=${utm_id}`;
        if (hasShulKiosk) {
          this.dashboardUrl = `${this.dashboardUrl}&${utnQuery}`;
        } else {
          this.dashboardUrl = `${this.dashboardUrl}?${utnQuery}`;
        }
      }

      const identity = params.get(Params.CARD_ID);
      if (identity) {
        this.cardLoginForm.patchValue({
          cardId: identity,
        });
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const otpFirstElement = document.getElementById(`otp_0_${this.ngOtpInput.componentKey}`);
      if (otpFirstElement && otpFirstElement.focus) {
        otpFirstElement.focus();
        this.$cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.notificationService.clearAllToaster();
  }

  onSubmit() {
    if (this.cardLoginForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService
      .matbiaCardLogin(this.cardLoginForm.value)
      .pipe(
        map((data) => data),
        switchMap((data) => {
          this.localStorageDataService.setLoginUserDataAndToken(data);
          if (this.localStorageDataService.isOrganization() || this.localStorageDataService.isBusiness()) {
            return this.settingAPI.getEntitySetting('UseBatchAsRedeem');
          }
          return of(null);
        })
      )
      .subscribe(
        (res) => {
          if (res) {
            this.localStorageDataService.setEntitySetting(res);
          }
          if (this.returnUrl !== '/') {
            this.route.navigateByUrl(this.returnUrl, { onSameUrlNavigation: 'reload' });
          } else {
            this.route.navigateByUrl(this.dashboardUrl, { onSameUrlNavigation: 'reload' });
          }
        },
        (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error, 'Error !');
        }
      );
  }

  onOtpChange(data: any) {
    this.cardLoginForm.patchValue({
      pin: data,
    });

    this.cardLoginForm.updateValueAndValidity();
  }
}
