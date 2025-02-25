import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgbCollapse, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import moment from 'moment';
import dayjs from 'dayjs';

import { Params } from '@enum/Params';
import { TransactionStatus } from '@enum/Transaction';

import { shakeTrigger } from '@commons/animations';
import { CustomValidator } from '@commons/custom-validator';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { CommonDataService } from '@commons/common-data-service.service';

import { MatbiaFormGroupService } from '@matbia/matbia-form-group/matbia-form-group.service';
import { PlaidButtonComponent } from '@matbia/plaid-link-button/plaid-button/plaid-button.component';
import { AfterTransactionComponent } from '@matbia/matbia-shared-popup/after-transaction/after-transaction.component';
import { AddFundsFromBankComponent } from '@matbia/matbia-form-group/add-funds-from-bank/add-funds-from-bank.component';
import { SmallDepositPopupComponent } from '@matbia/matbia-shared-popup/small-deposit-popup/small-deposit-popup.component';
import { MatbiaCardFormGroupComponent } from '@matbia/matbia-form-group/matbia-card-form-group/matbia-card-form-group.component';
import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { LinkViaRoutingPopupComponent } from '@matbia/matbia-shared-popup/link-via-routing-popup/link-via-routing-popup.component';
import { UploadBankStatementPopupComponent } from '@matbia/matbia-shared-popup/upload-bank-statement-popup/upload-bank-statement-popup.component';

import { AnalyticsService } from '@services/analytics.service';
import { AuthService } from '@services/API/auth.service';
import { DonorAPIService } from '@services/API/donor-api.service';
import { MatbiaCardObj, MatbiaCardSettingService } from '@services/API/matbia-card-setting.service';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';
import { PlaidSuccessMetadata } from '@services/ngx-plaid-link.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ConnectToBankAccountComponent } from '@matbia/matbia-form-group/connect-to-bank-account/connect-to-bank-account.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

@Component({
  selector: 'app-setup-card-setting',
  templateUrl: './setup-card-setting.component.html',
  imports: [
    SharedModule,
    PlaidButtonComponent,
    ConnectToBankAccountComponent,
    MatbiaCardFormGroupComponent,
    AddFundsFromBankComponent,
    InputErrorComponent,
    ButtonLoaderComponent,
  ],
  animations: [shakeTrigger],
})
export class SetupCardSettingComponent implements OnInit, AfterViewInit {
  @ViewChild('addFund', { static: false }) addFundComponent!: AddFundsFromBankComponent;
  public pinConfig = {
    length: 4,
    allowNumbersOnly: true,
    disableAutoFocus: true,
    inputClass: 'form-control otp-input-password',
    containerClass: 'pinnumber-box',
  };
  isLoading = false;
  isShulkiosk = false;
  isBlockPlaid = false;
  isLoadingConnect = false;
  isAnimate = false;

  isInLinking = false;

  userHandleControl!: UntypedFormControl;
  setupAccountForm!: UntypedFormGroup;
  matbiaCardDetailForm!: UntypedFormGroup;
  matbiaAddFundForm!: UntypedFormGroup;
  active = 1;
  isDevEnv = false;
  matbiaCardSubmitButton = false;
  isFromSendMeCard = false;

  modalOptions?: NgbModalOptions;
  isCreatePinDone = false;
  isSetupCardDone = false;
  isConnectBankDone = false;

  isEditNameCollapsed = true;

  SSNhasFocus = true;

  maxDate: dayjs.Dayjs = dayjs().subtract(18, 'year');
  minDate: dayjs.Dayjs = dayjs().subtract(99, 'year');
  showCardNumberExpDate: boolean = true;
  cardNumber: number | null = null;
  cardId: string | null = null;
  entityId: string | null = null;
  expiry: string | null = null;
  isEndWithnine: boolean = false;

  get userHandle() {
    return this.userHandleControl;
  }

  get nameRegisterWithBank() {
    return this.setupAccountForm.get('nameRegisterWithBank');
  }

  get FirstName() {
    return this.nameRegisterWithBank?.get('firstName');
  }

  get LastName() {
    return this.nameRegisterWithBank?.get('lastName');
  }

  get donateMore() {
    return this.setupAccountForm.get('donateMore');
  }

  get needToMoreTransfer() {
    return this.donateMore?.get('needMoreTransfer');
  }

  get BirthDate() {
    return this.donateMore?.get('birthDate');
  }

  get SSN() {
    return this.donateMore?.get('ssn');
  }

  get linkWith() {
    return this.setupAccountForm?.get('linkWith');
  }

  get haveUsernameAndPAssword() {
    return this.linkWith?.get('haveUsernameAndPAssword');
  }

  get confirmName() {
    return this.nameRegisterWithBank?.get('confirmName');
  }

  get isAgree() {
    return this.linkWith?.get('isAgree');
  }

  get CVV() {
    return this.matbiaCardDetailForm.get('cvv');
  }

  @ViewChild(MatbiaCardFormGroupComponent) matbiaCardForm!: MatbiaCardFormGroupComponent;

  @ViewChild(PlaidButtonComponent) plaidLinkButton!: PlaidButtonComponent;

  public isCollapsed = true;

  @ViewChild('manuallyLinkBankTemplate') manuallyLinkBankTemplate!: NgbCollapse;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    protected title: Title,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private pageRoute: PageRouteVariable,
    private notification: NotificationService,
    private localStorageService: LocalStorageDataService,
    private commonDataService: CommonDataService,
    private authService: AuthService,
    private matbiaFormGroupService: MatbiaFormGroupService,
    private matbiaCardSettingAPI: MatbiaCardSettingService,
    private matbiaDonorAPI: DonorAPIService,
    private donorTransactionAPI: DonorTransactionAPIService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private matbiaObserver: MatbiaObserverService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Card settings');
    this.initForm();

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    const state = history.state;
    if (state && state.isActivateCard == true) {
      this.showCardNumberExpDate = false;
    } else {
      this.showCardNumberExpDate = true;
    }
    if (state.cardNumber) {
      this.cardNumber = state.cardNumber;
    }
    if (state.cardId) {
      this.cardId = state.cardId;
    }
    if (state.expiry) {
      this.expiry = state.expiry;
      if (this.isEndWithNine(state.expiry)) {
        this.isEndWithnine = true;
        this.matbiaCardDetailForm.patchValue({
          corner4: this.matbiaFormGroupService.getCornerValidValue('0'),
        });

        this.matbiaCardDetailForm.updateValueAndValidity();
      }
    }
    this.activeRoute.queryParamMap.subscribe((params) => {
      const inStep = params.get(Params.ACTIVE_STEP);

      const shulValue = params.get(Params.SHUL_KIOSK);

      const isFromSendMeCard = params.get('isFromSendMeCard');

      if (isFromSendMeCard && this.commonDataService.isStringTrue(isFromSendMeCard)) {
        this.isFromSendMeCard = true;
      }

      if (shulValue) {
        this.isShulkiosk = true;
      } else {
        this.isShulkiosk = false;
      }

      const blockPlaid = params.get(Params.BLOCK_PLAID);

      if (blockPlaid && this.commonDataService.isStringTrue(blockPlaid)) {
        this.isBlockPlaid = true;
      } else {
        this.isBlockPlaid = false;
      }

      const userHandle = params.get(Params.USER_HANDLE);
      if (userHandle) {
        this.userHandleControl.patchValue(userHandle);
        this.userHandleControl.updateValueAndValidity();

        this.matbiaAddFundForm.patchValue({
          userHandle,
        });
        this.matbiaAddFundForm.updateValueAndValidity();

        if (inStep) {
          const step = +inStep;

          this.active = step;
          if (this.active === 1) {
            this.getCardDetails();
          }

          if (this.active === 2) {
            this.getDonorInfo();
          }
        } else {
          if (shulValue) {
            this.active = 1;
          }

          this.getCardDetails();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.haveUsernameAndPAssword?.valueChanges.subscribe(() => {
      this.manuallyLinkBankTemplate.toggle();
    });
  }

  initForm() {
    this.userHandleControl = this.fb.control('', Validators.compose([Validators.required]));

    this.matbiaCardDetailForm = this.matbiaFormGroupService.initMatbiaCardFormGroup({
      cardId: '',
      nameOnCard: '',
      cardNumber: '',
      cardExp: '',
      cvv: '',
      phoneNum: '',

      statusID: 0,

      corner1: '',
      corner2: '',
      corner3: '',
      corner4: '',
      pin: '',
    });

    this.matbiaAddFundForm = this.matbiaFormGroupService.initAddFundFormGroup({
      isRecurring: false,
      isDonate: false,
      userHandle: this.userHandle?.value,
      amount: null,
      bankAccountId: null,
      transDate: moment(new Date()),
      transferNowAmount: null,
      isNotifyOnEmail: true,
      isNotifyOnSMS: false,
      recurringPayment: {
        count: null,
        amount: null,
        frequency: null,
        scheduleDate: null,
      },
    });

    this.setupAccountForm = this.fb.group({});

    this.setupAccountForm.addControl(
      'nameRegisterWithBank',
      this.fb.group({
        confirmName: this.fb.control(false, Validators.compose([Validators.required, Validators.requiredTrue])),
        firstName: this.fb.control('', Validators.compose([Validators.required])),
        lastName: this.fb.control('', Validators.compose([Validators.required])),
      })
    );

    this.setupAccountForm.addControl(
      'donateMore',
      this.fb.group({
        needMoreTransfer: this.fb.control('0'),
        birthDate: this.fb.control(null, Validators.compose([Validators.required])),
        ssn: this.fb.control(null, Validators.compose([Validators.required, CustomValidator.ssnValidator])),
      })
    );

    this.setupAccountForm.addControl(
      'linkWith',
      this.fb.group({
        haveUsernameAndPAssword: this.fb.control('1'),
        isAgree: this.fb.control(false, Validators.compose([Validators.requiredTrue])),
      })
    );
  }

  // Matbia card setup
  onMatbiaCardSetup() {
    if (this.matbiaCardDetailForm.invalid) {
      this.matbiaCardDetailForm.markAllAsTouched();

      if (
        this.matbiaCardForm.FirstCorner?.invalid ||
        this.matbiaCardForm.SecondCorner?.invalid ||
        this.matbiaCardForm.ThirdCorner?.invalid ||
        this.matbiaCardForm.FourthCorner?.invalid
      ) {
        return;
      }

      if (this.CVV?.invalid) {
        this.matbiaCardForm.openCardPinPopup();
        return;
      }

      this.isAnimate = true;

      setTimeout(() => {
        this.isAnimate = false;
      }, 1500);
      return;
    }

    const cardPayload = {
      cardId: this.matbiaCardDetailForm.get('cardId')?.value
        ? this.matbiaCardDetailForm.get('cardId')?.value
        : this.cardId,
      pin: this.matbiaCardDetailForm.get('cvv')?.value,
      cardHolderName: this.matbiaCardDetailForm.get('nameOnCard')?.value,
      phoneNum: this.matbiaCardDetailForm.get('phoneNum')?.value,
      corner1: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner1')?.value),
      corner2: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner2')?.value),
      corner3: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner3')?.value),
      corner4: this.matbiaFormGroupService.buildCornerValue(this.matbiaCardDetailForm.get('corner4')?.value),
      createdBy: 0,
      statusID: this.matbiaCardDetailForm.get('statusID')?.value,
      entityId: this.localStorageService.getLoginUserData()?.encryptedEntityId,
    };

    this.isLoading = true;

    this.matbiaCardSettingAPI.SaveSetting(cardPayload).subscribe(
      (res) => {
        if (res) {
          this.isSetupCardDone = true;
          const currentUser = this.localStorageService.getLoginUserData();
          this.localStorageService.setIsCardSettingsSaved();
          localStorage.removeItem(`card_pin_${this.userHandle.value}`);

          if (this.isShulkiosk) {
            this.router.navigate([], {
              relativeTo: this.activeRoute,
              queryParams: { activeStep: 2 },
              queryParamsHandling: 'merge',
            });
            return;
          }

          if (this.isFromSendMeCard && currentUser && !currentUser.isCardSettingsSaved) {
            this.router.navigate([`/${PageRouteVariable.SetupAlertSetting}`], { queryParamsHandling: 'merge' });
            return;
          }

          this.refreshToken();
        }
      },
      (err) => {
        this.isLoading = false;
        this.notification.showError(err.error, 'Error!');
      }
    );
  }

  isEndWithNine(expiry: string | null) {
    if (expiry) {
      const character = expiry.trim().charAt(expiry.length - 1);
      return character === '9';
    }
    return false;
  }

  /**
   *
   * Check Matbia card object have pin value then display with pin otherwise display with From CVV form Field.
   * if First time CVV also not found while refresh then get from local storage.
   *
   * @param setting MatbiaCardObj
   * @returns Number
   */
  private getValueForPin(setting: MatbiaCardObj) {
    if (!setting.pin) {
      if (this.CVV?.value) {
        return this.CVV?.value;
      }

      const pin = localStorage.getItem(`card_pin_${this.userHandle.value}`);

      return pin ? +pin : setting.pin;
    }

    return setting.pin;
  }

  getCardDetails() {
    this.isLoading = true;
    this.matbiaCardSettingAPI.GetSetting(this.userHandle?.value).subscribe(
      (res) => {
        this.isLoading = false;
        if (res && res.length !== 0) {
          const firstCardSetting = res[0];

          this.matbiaCardDetailForm.patchValue({
            nameOnCard: firstCardSetting.cardHolderName,
            cardNumber: firstCardSetting.cardNum,
            cardId: firstCardSetting.cardId != null ? firstCardSetting.cardId : this.cardId,
            corner1: this.matbiaFormGroupService.getCornerValidValue(firstCardSetting.corner1),
            corner2: this.matbiaFormGroupService.getCornerValidValue(firstCardSetting.corner2),
            corner3: this.matbiaFormGroupService.getCornerValidValue(firstCardSetting.corner3),
            corner4: this.matbiaFormGroupService.getCornerValidValue(firstCardSetting.corner4),

            cardExp: firstCardSetting.expiry,
            cvv: this.getValueForPin(firstCardSetting),
            phoneNum: firstCardSetting.phoneNum,

            statusID: firstCardSetting.statusID || 0,
          });

          this.matbiaCardDetailForm.get('cardNumber')?.disable();
          this.matbiaCardDetailForm.get('cardExp')?.disable();

          this.matbiaCardDetailForm.updateValueAndValidity();

          if (this.isEndWithNine(firstCardSetting.expiry)) {
            this.matbiaCardDetailForm.patchValue({
              corner4: this.matbiaFormGroupService.getCornerValidValue('0'),
            });

            this.matbiaCardDetailForm.updateValueAndValidity();
          }
        }
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  onMatbiaCardNextCorner() {
    this.matbiaCardForm.nextCorner();
  }

  canMatbiaCardSetup(data: boolean) {
    this.matbiaCardSubmitButton = data;
  }

  // Link bank
  getDonorInfo() {
    this.isLoading = true;
    this.matbiaDonorAPI.get(this.userHandle?.value).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.setupAccountForm.patchValue({
            nameRegisterWithBank: {
              firstName: res.firstName,
              lastName: res.lastName,
            },
          });

          this.setupAccountForm.updateValueAndValidity();
        }
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  displayDonorFullName() {
    const firstVal = this.nameRegisterWithBank?.get('firstName')?.value;
    const lastVal = this.nameRegisterWithBank?.get('lastName')?.value;
    return `${firstVal} ${lastVal}`;
  }

  onLinked(data: { token: string; metadata: PlaidSuccessMetadata }) {
    if (this.plaidLinkButton.checkIsManuallyAccountLink(data.metadata)) {
      this.refreshToken();
      return;
    }

    this.isConnectBankDone = true;
    this.active = 3;
    this.localStorageService.setIsBankAccountLinked();
  }

  openLinkPopup() {
    this.isInLinking = true;
    this.modalOptions = {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'link-via-Routing-popup',
    };
    const modal = this.modalService.open(LinkViaRoutingPopupComponent, this.modalOptions);

    modal.componentInstance.userHandle = this.userHandle?.value;

    modal.componentInstance.accountName = this.displayDonorFullName();

    modal.componentInstance.linked.subscribe(() => {
      this.isConnectBankDone = true;
      this.active = 3;

      this.localStorageService.setIsBankAccountLinked();
    });

    modal.closed.subscribe(() => {
      this.isInLinking = false;
    });
  }

  openTerms(event: any) {
    event.preventDefault();

    if (this.isShulkiosk) {
      return;
    }

    this.modalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup',
      size: 'xl',
      scrollable: true,
    };
    this.modalService.open(TermsOfServicePopupComponent, this.modalOptions);
  }

  // Add funds
  onAddFunds() {
    if (this.matbiaAddFundForm.invalid) {
      this.matbiaAddFundForm.markAllAsTouched();
      return;
    }

    const userId = this.localStorageService.getLoginUserId();
    const value = this.addFundComponent.finalDepositValues();
    const apiData = {
      ...value,
      createdBy: userId || 0,
    };

    this.doDeposit(apiData);
  }

  doDeposit(apiData: any) {
    const confModalRef = this.addFundComponent.openConfirmation();

    confModalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (!val) {
        return;
      }

      this.executeDeposit(apiData);
    });
  }

  private executeDeposit(apiData: any) {
    const loader = this.notification.initLoadingPopup({ showCancelButton: false });
    loader.then((res) => {
      if (res.isConfirmed) {
        this.goToSendMeCard();
        return;
      }
    });

    this.donorTransactionAPI.deposit(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.close();
        const modelRef = this.afterDepositPopup();
        this.analytics.initAddFundsEvent();
        modelRef.componentInstance.isInFlow = true;
        modelRef.componentInstance.amount = apiData.amount;
        modelRef.componentInstance.bankAccount = this.addFundComponent.linkedAccountList.find(
          (o) => o.bankAccountId === apiData.bankAccountId
        );

        modelRef.closed.subscribe((val: boolean) => {
          if (val) {
            this.goToSendMeCard();
          }
        });

        modelRef.componentInstance.status = res.status;

        // Do first check it's schedule or not
        if (res.status === TransactionStatus.SCHEDULED) {
          modelRef.componentInstance.isSuccess = true;
          modelRef.componentInstance.depositAvailable = res.depositAvailable;
          modelRef.componentInstance.dbTransId = res.encryptedDbTransId;
          modelRef.componentInstance.frequency = this.addFundComponent.recurringComponent.transactionRecurrences.find(
            (o) => o.id === apiData.recurringPayment?.frequency
          )?.name;
          return;
        }

        if (!res.gatewayResponse) {
          modelRef.componentInstance.isSuccess = false;
          modelRef.componentInstance.errorMessage = res.status;
          return;
        }

        if (res.gatewayResponse?.errors.length !== 0) {
          modelRef.componentInstance.isSuccess = false;
          modelRef.componentInstance.errorMessage = res.gatewayResponse?.errors[0].error;
          if (res?.error && res?.error.length !== 0) {
            modelRef.componentInstance.errorMessageFromServer = res?.error[0].error;
          }
          return;
        }

        if (res.error) {
          modelRef.componentInstance.isSuccess = false;
          modelRef.componentInstance.errorMessageFromServer = res?.error[0].error;
          return;
        }

        modelRef.componentInstance.isSuccess = true;
        modelRef.componentInstance.depositAvailable = res.depositAvailable;
        modelRef.componentInstance.dbTransId = res.encryptedDbTransId;
      },
      (err) => {
        this.notification.hideLoader();
        this.notification.close();
        const modelRef = this.afterDepositPopup();
        modelRef.componentInstance.isInFlow = true;
        modelRef.componentInstance.amount = apiData.amount;
        modelRef.componentInstance.bankAccount = this.addFundComponent.linkedAccountList.find(
          (o) => o.bankAccountId === apiData.bankAccountId
        );
        modelRef.componentInstance.isSuccess = false;
        modelRef.componentInstance.errorMessage = err.error;
      }
    );
  }

  triggerAnimation() {
    if (this.isAnimate) {
      return;
    }

    this.isAnimate = true;
    setTimeout(() => {
      this.isAnimate = false;
    }, 1000);
  }

  commonConnectButton(eventData: { isWithPlaid: boolean }) {
    if (this.nameRegisterWithBank?.invalid) {
      this.nameRegisterWithBank?.markAllAsTouched();

      this.triggerAnimation();
      return;
    }

    if (!this.isAgree?.value) {
      this.linkWith?.markAllAsTouched();

      this.triggerAnimation();
      return;
    }

    const { confirmName, ...restData } = this.nameRegisterWithBank?.value;

    let bodyData = { ...restData, userHandle: this.userHandle.value };

    if (this.needToMoreTransfer?.value && this.needToMoreTransfer?.value === '1') {
      if (this.donateMore?.invalid) {
        this.donateMore.markAllAsTouched();
        this.triggerAnimation();
        return;
      }

      const data = this.donateMore?.value;
      const { needMoreTransfer, birthDate, ...restValues } = data;

      bodyData = {
        ...bodyData,
        ...restValues,
        birthDate: birthDate.startDate.format('YYYY-MM-DD'),
      };
    }

    this.isLoadingConnect = true;
    this.matbiaDonorAPI.update(bodyData).subscribe(
      (res) => {
        this.isLoadingConnect = false;
        if (res) {
          if (res.errors && res.errors.length !== 0) {
            this.notification.showError(res.errors[0].error, 'Error !');
            return;
          }

          if (!eventData.isWithPlaid) {
            this.openLinkPopup();
            return;
          }

          // always open plaid
          this.plaidLinkButton.openLinkAccount();
          this.isInLinking = true;
          this.plaidLinkButton.exited.subscribe(() => {
            this.isInLinking = false;
          });
        }
      },
      (err) => {
        this.isLoadingConnect = false;
        this.notification.showError(err.error, 'Error !');
      }
    );
  }

  openBankStatementPopup() {
    this.modalOptions = {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'upload-bank-statement-popup',
    };
    this.modalService.open(UploadBankStatementPopupComponent, this.modalOptions);
  }

  smallDepositPopup() {
    this.modalOptions = {
      centered: true,
      keyboard: false,
      backdrop: 'static',
      windowClass: 'small-deposit-popup',
    };
    const modal = this.modalService.open(SmallDepositPopupComponent, this.modalOptions);
  }

  afterDepositPopup() {
    this.modalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      windowClass: 'transaction-modal-main modal-afterTransaction modal-funds',
      scrollable: true,
    };
    return this.modalService.open(AfterTransactionComponent, this.modalOptions);
  }

  /**
   * After from authentication need to update user data and navigate to portal
   *
   * @param navigateTo Router array link default to dashboard page
   */
  refreshToken(navigateTo: Array<string> = [PageRouteVariable.DashboardUrl]) {
    const accessToken = this.localStorageService.getLoginUserAccessToken();
    const refreshToken = this.localStorageService.getLoginUserRefreshToken();
    const loginUserID = this.localStorageService.getLoginUserId();

    const modelData: any = {
      accessToken,
      refreshToken,
      LoginUserID: loginUserID,
    };

    this.authService.refreshToken(modelData).subscribe(
      (data: any) => {
        this.localStorageService.setLoginUserDataAndToken(data);
        this.router.navigate(navigateTo);
      },
      (err) => {
        this.notification.showError(err.error, 'Error!');
      }
    );
  }

  onSkipAddFunds() {
    this.localStorageService.setIsSkipBankAccountLinked();
    this.goToSendMeCard();
  }

  goToSendMeCard() {
    if (this.isShulkiosk) {
      this.refreshToken();
      return;
    }

    const currentUser = this.localStorageService.getLoginUserData();

    if (currentUser && currentUser.isCardSettingsSaved) {
      this.refreshToken();
      return;
    }
    this.refreshToken();
    return;
  }

  goToAutoDepositsPage() {
    this.refreshToken(this.pageRoute.getAutoDepositRouterLink());
  }

  onOtpChange(data: any) {
    this.matbiaCardDetailForm.patchValue({
      cvv: data,
    });

    this.matbiaCardDetailForm.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  onHideShowPassword() {
    this.pinConfig.inputClass =
      this.pinConfig.inputClass == 'form-control otp-input-password'
        ? 'form-control'
        : 'form-control otp-input-password';
    this.changeDetectorRef.detectChanges();
  }

  onPinContinue() {
    if (this.CVV?.valid) {
      localStorage.setItem(`card_pin_${this.userHandle.value}`, this.CVV.value);
    }

    this.isCreatePinDone = true;
    this.router.navigate([], {
      relativeTo: this.activeRoute,
      queryParams: { activeStep: 1 },
      queryParamsHandling: 'merge',
      state: { ...history.state },
    });
  }
}
