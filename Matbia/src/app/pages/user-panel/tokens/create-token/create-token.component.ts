import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import moment from 'moment';
import dayjs from 'dayjs';

import { CustomValidator } from '@commons/custom-validator';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';

import { DonorAPIService } from '@services/API/donor-api.service';
import { DonorTokenAPIService } from '@services/API/donor-token-api.service';
import { NotificationService } from '@commons/notification.service';
import { NewTokensObj } from 'src/app/models/panels';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { TokensPdfComponent } from '@matbia/matbia-panel-shared/tokens-pdf/tokens-pdf.component';
import { TokenSmsPopupComponent } from '../../popups/token-sms-popup/token-sms-popup.component';
import { TokenEmailPopupComponent } from '../../popups/token-email-popup/token-email-popup.component';
import { Title } from '@angular/platform-browser';
import { DonorDashboardService } from '@services/API/donor-dashboard.service';
import { SettingAPIService } from '@services/API/setting-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-create-token',
  templateUrl: './create-token.component.html',
  styleUrls: ['./create-token.component.scss'],
  imports: [SharedModule, TokensPdfComponent, AmountInputComponent, InputErrorComponent],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class CreateTokenComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  isGenerated = false;

  availableBalance = 0;
  formGroup!: FormGroup;

  tokens: Array<NewTokensObj> = [];
  listData: Array<NewTokensObj> = [];
  tokenNum: number = 0;
  tokenAmt: number = 0;
  tokenId: number = 0;
  settingsToken: any = '';
  isCopyAction: boolean = false;
  fromLocal: boolean = true;

  minDate: dayjs.Dayjs = dayjs();
  modalOptions?: NgbModalOptions;

  pdfSrc: string | ArrayBuffer | undefined;
  isPresetAmountHovering: boolean = true;
  availableFundsTooltip = `
  As of now deposits that are still pending or funding can't be used to generate Tokens. 
  We're working to help you generate tokens even with Funds that are still funding. 
  Stay on the lookout.`;
  locale = {
    format: 'MM/DD/YYYY',
  };

  ranges: any = {
    'In 30 Days': [moment().add(29, 'days').startOf('day'), moment().add(29, 'days').endOf('day')],
    'In 90 Days': [moment().add(89, 'days').startOf('day'), moment().add(89, 'days').endOf('day')],
    'End of year': [moment().endOf('year').startOf('day'), moment().endOf('year').endOf('day')],
  };

  amounts = [
    { amt: 5, isActive: false, displayVal: '+ $5.00' },
    { amt: 10, isActive: false, displayVal: '+ $10.00' },
    { amt: 18, isActive: false, displayVal: '+ $18.00' },
    { amt: 25, isActive: false, displayVal: '+ $25.00' },
  ];
  clickCustomButton: boolean = false;
  rangeSelected: boolean = true;
  selectedDonorDateRange: any = {
    fromDate: moment(new Date()).subtract(29, 'days').format('YYYY-MM-DD'),
    toDate: moment(new Date()).format('YYYY-MM-DD'),
  };

  get UserHandle() {
    return this.formGroup.get('userHandle');
  }

  get Tokens() {
    return this.formGroup.get('tokens') as FormArray;
  }

  get TokensValue() {
    return this.Tokens.value as Array<{ tokenAmount: string | number | null; tokenCount: string | number | null }>;
  }

  get ExpDate() {
    return this.formGroup.get('expDate');
  }

  get TokensTotal() {
    const total = this.TokensValue.reduce((sumOf, o) => {
      if (o.tokenAmount && o.tokenCount) {
        const tokenSum = +o.tokenAmount * +o.tokenCount;
        sumOf = sumOf + tokenSum;
        return sumOf;
      }
      return sumOf;
    }, 0);

    return total;
  }

  @ViewChild('generateTokenModal') generateTokenModal!: any;

  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;
  @ViewChild(TokensPdfComponent) tokenPdfCom!: TokensPdfComponent;

  @ViewChild('newLi') newLi!: TemplateRef<any>;
  constructor(
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private fb: FormBuilder,
    private localStorageData: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private notification: NotificationService,
    private donorAPI: DonorAPIService,
    private donorTokenAPI: DonorTokenAPIService,
    private setting: SettingAPIService,
    private localStorage: LocalStorageDataService,
    public donorDashboardAPI: DonorDashboardService,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<NewTokensObj>,

    private viewContainerRef: ViewContainerRef
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Generate tokens');
    this.initField();

    this.getBalance();

    this.headerInit();
    this.getExpiredSetting();
    this.settingsToken = this.localStorage.getSettingsToken();
  }

  headerInit() {
    this.gridService.TableHeaders = [
      {
        colName: 'Amount',
        sortName: 'amount',
      },
      {
        colName: 'Expiry Date',
        sortName: 'expDate',
      },
      {
        colName: 'Generated Date And Time',
        sortName: 'generatedDateTime',
      },
      {
        colName: 'Status',
        sortName: 'status',
      },
      {
        colName: 'Token Id',
        sortName: 'tokenID',
      },
      {
        colName: 'Token Number',
        sortName: 'tokenNumber',
      },
    ];
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
    this.pickerDirective.ref.detectChanges();
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
    this.pickerDirective.ref.detectChanges();

    const embeddedViewRef = this.viewContainerRef.createEmbeddedView(this.newLi);

    embeddedViewRef.detectChanges();

    for (const node of embeddedViewRef.rootNodes) {
      this.pickerDirective.picker.pickerContainer.nativeElement.querySelector('ul').appendChild(node);
    }
    this.pickerDirective.rangeClicked.subscribe(() => {
      this.clickCustomButton = false;
    });
    this.changeDetectorRef.detectChanges();
  }

  onCustomRange() {
    this.pickerDirective.picker.leftCalendar.month = this.pickerDirective.picker.leftCalendar.month.month(
      dayjs().month()
    );

    if (this.pickerDirective.picker.linkedCalendars) {
      this.clickCustomButton = true;
      this.rangeSelected = false;
      this.pickerDirective.picker.rightCalendar.month = this.pickerDirective.picker.rightCalendar.month.month(
        dayjs().month()
      );

      document.querySelectorAll('.active').forEach((element) => {
        element.classList.remove('active');
      });
    }

    this.pickerDirective.picker.updateCalendars();

    this.changeDetectorRef.detectChanges();
    this.pickerDirective.ref.detectChanges();
  }

  onDatesUpdated(event: any) {
    const { startDate } = event;
    let isOutsideRange = true;

    for (let range in this.ranges) {
      if (startDate?.$d >= this.ranges[range][0]?.$d && startDate?.$d <= this.ranges[range][1]?.$d) {
        isOutsideRange = false;
        this.rangeSelected = true;
        document.querySelectorAll('.custom').forEach((element) => {
          element.classList.remove('active');
        });
        this.clickCustomButton = false;
        break;
      }
    }

    if (isOutsideRange) {
      document.querySelectorAll('.custom').forEach((element) => {
        element.classList.add('active');
      });
    }
  }

  // For range selection
  onRangeSelect() {
    this.rangeSelected = true;
    document.querySelectorAll('.custom').forEach((element) => {
      element.classList.remove('active');
    });
    this.clickCustomButton = false;
  }

  ngOnDestroy(): void {
    this.gridService.ListData = [];
  }

  private initField() {
    this.formGroup = this.fb.group({
      userHandle: this.fb.control(null, Validators.compose([Validators.required])),
      expDate: this.fb.control(null),
      tokens: this.fb.array([]),
    });

    const userHandle = this.localStorageData.getLoginUserUserName();
    this.UserHandle?.patchValue(userHandle);

    this.ExpDate?.patchValue({
      startDate: moment().add(89, 'days').startOf('day').set('hours', 0).set('minutes', 0),
      endDate: moment().add(89, 'days').startOf('day').set('hours', 23).set('minutes', 59),
    });

    this.ExpDate?.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  onAddToken() {
    this.Tokens.push(
      this.fb.group({
        tokenAmount: this.fb.control(
          null,
          Validators.compose([
            Validators.required,
            CustomValidator.greaterThan(1.0, true, 'Starting amount is $1.00', true),
          ])
        ),
        tokenCount: this.fb.control(0, Validators.compose([Validators.required, Validators.min(1)])),
      })
    );

    this.changeDetectorRef.detectChanges();
  }

  onIncrease(index: number, value: number | string) {
    this.Tokens.at(index).patchValue({
      tokenCount: +value + 1,
    });
    this.changeDetectorRef.detectChanges();
  }

  onDecrease(index: number, value: number | string) {
    const nextValue = +value - 1;
    this.Tokens.at(index).patchValue({
      tokenCount: nextValue > 0 ? nextValue : 0,
    });
    this.changeDetectorRef.detectChanges();
  }

  private getBalance() {
    this.donorAPI.getBalance().subscribe(
      (res) => {
        this.availableBalance = res.availableBalance || 0;
      },
      () => {
        this.availableBalance = 0;
      }
    );
  }

  /**
   * Add default token count as 1 with given amount value
   */
  addAmount(amountValue: number) {
    // Check if there are no tokens or the last token has an amount set
    if (this.TokensValue.length === 0 || this.TokensValue[this.TokensValue.length - 1]?.tokenAmount !== null) {
      this.onAddToken();
    }

    // Find the first empty token (no amount set)
    const emptyTokenIndex = this.TokensValue.findIndex((o) => o.tokenAmount === null);

    if (emptyTokenIndex !== -1) {
      // If there's only one token, set amount and count to 1
      if (this.TokensValue.length === 1) {
        this.Tokens.at(emptyTokenIndex).patchValue({
          tokenAmount: amountValue,
          tokenCount: 1,
        });
      } else {
        // If there are multiple tokens, set amount and count to 1
        this.Tokens.at(emptyTokenIndex).patchValue({
          tokenAmount: amountValue,
          tokenCount: 1,
        });
      }
    }

    this.Tokens.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  }

  setActiveAmount(amount: any) {
    this.amounts.forEach((item) => {
      item.isActive = item.amt === amount.amt;
    });
    this.addAmount(amount.amt);
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.openModal();
  }

  private openModal() {
    const option: NgbModalOptions = {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup donate-popup',
      size: 'md',
      scrollable: true,
    };

    this.modalService.open(this.generateTokenModal, option);
  }

  goToList() {
    this.router.navigate(this.pageRoute.getTokenListRouterLink());
  }

  goToMore(event: any) {
    event.preventDefault();
    this.router.navigate(this.pageRoute.getGenerateTokensRouterLink());
  }

  doGenerate(modal: NgbModalRef) {
    const modalRef = this.notification.initLoadingPopup();
    modalRef.then((res) => {
      if (res.isConfirmed) {
      }
    });

    const token = this.TokensValue.map((obj) => {
      return {
        tokenAmount: obj.tokenAmount ? +obj.tokenAmount : 0,
        tokenCount: obj.tokenCount ? +obj.tokenCount : 0,
        expDate: this.ExpDate?.value.endDate,
      };
    });

    this.donorTokenAPI
      .generate({
        userHandle: this.UserHandle?.value,
        tokens: token,
      })
      .subscribe(
        (res: any) => {
          if (res) {
            modal.close();
            this.tokens = res;
            if (this.tokens.length > 0) {
              this.tokenNum = this.tokens[0].tokenNumber;
              this.tokenAmt = this.tokens[0].amount;
              this.tokenId = this.tokens[0].tokenID;
            }
            this.isGenerated = true;
            this.notification.hideLoader();
            this.notification.close();
          }
        },
        (err: any) => {
          this.notification.throwError(err.error);
        }
      );
  }

  downloadCsv() {
    this.listData = this.tokens;
    this.gridService.ListData = this.listData || [];
    this.gridService.exportProcess('Token');
  }

  getGenerateTokensRouterLink() {
    return this.pageRoute.getGenerateTokensRouterLink();
  }

  getTokenListRouterLink() {
    return this.pageRoute.getTokenListRouterLink();
  }

  get isDisableActions(): boolean {
    const total = this.TokensValue.reduce((sumOf, o) => {
      if (o.tokenCount) {
        sumOf = sumOf + +o.tokenCount;
        return sumOf;
      }
      return sumOf;
    }, 0);

    return total > 1;
  }

  sendSms() {
    const modalRef = this.modalService.open(TokenSmsPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
    });

    modalRef.componentInstance.tokenAmt = this.tokenAmt;
    modalRef.componentInstance.tokenNum = this.tokenNum;
    modalRef.componentInstance.tokenId = this.tokenId;
  }

  sendEmail() {
    const modalRef = this.modalService.open(TokenEmailPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'drag_popup tokan-email donate-popup',
      size: 'md',
      scrollable: false,
    });

    modalRef.componentInstance.tokenAmt = this.tokenAmt;
    modalRef.componentInstance.tokenNum = this.tokenNum;
    modalRef.componentInstance.tokenId = this.tokenId;
  }

  print() {
    this.tokenPdfCom.print();
  }

  //copy functionlality code started
  @HostBinding('class.apikey-hash-wrap') get valid() {
    return true;
  }

  onClicked(event: any) {
    event.preventDefault();
    if (this.isCopyAction) {
      return;
    }

    this.isCopyAction = true;
    setTimeout(() => {
      this.isCopyAction = false;
    }, 2000);
  }

  displayValue() {
    if (this.tokenNum) {
      return this.tokenNum;
    }
    if (this.fromLocal) {
      return this.localStorage.getLoginUserUserName();
    }
    return '';
  }
  //copy functionlality code endeed

  isActive(Tokens: any, index: number): boolean {
    let totalRecordsLength = Tokens.value.length - 1;
    return totalRecordsLength == index;
  }

  isInvalidDate(date: dayjs.Dayjs) {
    return date.isBefore(dayjs().subtract(0, 'day'));
  }

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }
  goToTokenSettingsPage() {
    this.router.navigate(this.pageRoute.getTokenSettingsRouterLink());
  }
  getExpiredSetting() {
    this.setting.getExpiredTokenSetting().subscribe(
      (res) => {
        this.localStorage.setSettingsToken(res.settingValue);
      },
      (err) => {
        console.log(err, 'err');
      }
    );
  }
}
