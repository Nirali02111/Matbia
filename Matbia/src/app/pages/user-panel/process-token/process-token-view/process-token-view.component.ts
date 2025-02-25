import {
  Inject,
  ViewChild,
  Component,
  OnInit,
  OnDestroy,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CanDeactivateType } from '@commons/guards/leave-token-process.guard';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { TokenStatus } from '@enum/Token';
import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import {
  ProcessTokenObj,
  TokenStatusType,
  OrganizationTokenAPIService,
} from '@services/API/organization-token-api.service';
import { Observable } from 'rxjs';

interface infoSectionObj {
  count: number;
  amount: number;
}

interface infoSection {
  cleared: infoSectionObj;
  expired: infoSectionObj;
  voided: infoSectionObj;
}

import { SharedModule } from '@matbia/shared/shared.module';
import { ProcessTokenListRowItemComponent } from '@matbia/matbia-list-row-item/process-token-list-row-item/process-token-list-row-item.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-process-token-view',
  templateUrl: './process-token-view.component.html',
  styleUrls: ['./process-token-view.component.scss'],
  imports: [SharedModule, ProcessTokenListRowItemComponent, AmountInputComponent, InputErrorComponent],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class ProcessTokenViewComponent implements OnInit, AfterContentInit, OnDestroy, AfterViewInit {
  formGroup!: FormGroup;

  tokenMask = '0000 0000';

  infoSection: infoSection = {
    cleared: {
      count: 0,
      amount: 0,
    },
    expired: {
      count: 0,
      amount: 0,
    },
    voided: {
      count: 0,
      amount: 0,
    },
  };

  get OrgHandle() {
    return this.formGroup.get('orgHandle');
  }

  get TokenNumber() {
    return this.formGroup.get('tokenNumber');
  }

  get TokenAmount() {
    return this.formGroup.get('tokenAmount');
  }

  rows$!: Observable<Array<ProcessTokenObj>>;
  total$!: Observable<number>;

  listArray: Array<ProcessTokenObj> = [];

  @ViewChild(AmountInputComponent, { static: false }) amountInput!: AmountInputComponent;

  @ViewChild('tokenNumInput', { static: false }) tokenNumInput!: ElementRef;

  constructor(
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private pageRoute: PageRouteVariable,
    private localStorageData: LocalStorageDataService,
    private notification: NotificationService,
    private orgTokenAPI: OrganizationTokenAPIService,
    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<ProcessTokenObj>
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  handleClose() {
    let processTokens = this.localStorageData.getProcessTokenListData();
    return processTokens.length <= 0 ? true : false;
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Process Token');

    this.rows$ = this.gridService.rows$ as Observable<ProcessTokenObj[]>;
    this.total$ = this.gridService.total$;

    this.rows$.subscribe((list) => {
      if (list.length !== 0) {
        this.localStorageData.setProcessTokenListData(list);
      }

      this.infoSection = {
        cleared: this.filterRecord(list, TokenStatus.GENERATED),
        expired: this.filterRecord(list, TokenStatus.EXPIRED),
        voided: this.filterRecord(list, TokenStatus.VOIDED),
      };

      this.listArray = list;
    });

    this.gridService.Pagination = false;

    this.syncLocal();
    this.initFields();

    this.formGroup.valueChanges.subscribe((val) => {
      if (this.tokenNumInput && !val.tokenNumber) {
        this.tokenNumInput.nativeElement.focus();
        this.changeDetectorRef.detectChanges();
        return;
      }

      if (val.tokenNumber && val.tokenNumber.length === 8) {
        this.amountInput.doFocus();
        this.changeDetectorRef.detectChanges();
        return;
      }
    });
  }

  canDeactivate(): CanDeactivateType {
    let processTokens = this.localStorageData.getProcessTokenListData();
    if (processTokens.length <= 0) return true;

    const modalRef = this.notification.initWarningPopup(
      'Are you sure?',
      'By cancelling now the tokens you have entered will have to be reentered at a later date'
    );

    return modalRef.then((res) => {
      return res.isDismissed ? false : true;
    });
  }

  private filterRecord(list: Array<ProcessTokenObj>, status: TokenStatusType): infoSectionObj {
    const result = list.filter((obj) => {
      return obj.status === status;
    });

    return {
      count: result.length,
      amount: result.reduce((sum, obj) => {
        sum = sum + obj.tokenAmount;
        return sum;
      }, 0),
    };
  }

  private syncLocal() {
    const list = this.localStorageData.getProcessTokenListData();
    this.gridService.ListData = list;
  }

  ngAfterViewInit(): void {
    if (this.tokenNumInput) {
      this.tokenNumInput.nativeElement.focus();
      this.changeDetectorRef.detectChanges();
    }
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.localStorageData.setProcessTokenListData([]);
    this.gridService.ListData = [];
  }

  private initFields() {
    const username = this.localStorageData.getLoginUserUserName();

    this.formGroup = this.fb.group({
      orgHandle: this.fb.control(username, Validators.compose([Validators.required])),
      tokenNumber: this.fb.control(null, Validators.compose([Validators.required])),
      tokenAmount: this.fb.control(null, Validators.compose([Validators.required])),
    });
  }

  clearToken(event: any) {
    event.preventDefault();
    this.TokenNumber?.patchValue(null);
    this.TokenNumber?.updateValueAndValidity();
    this.TokenAmount?.patchValue(null);
    this.TokenAmount?.updateValueAndValidity();
  }

  focusout() {
    this.amountInput.doFocusout();
    this.amountInput.doFormatAmt(this.TokenAmount?.value);
  }

  isSubmit = false;

  onValidate() {
    this.isSubmit = true;
    if (this.TokenNumber?.hasError('serverError')) {
      if (this.TokenNumber?.errors) {
        const { serverError, ...errors } = this.TokenNumber?.errors;
        this.TokenNumber?.setErrors(errors);
        this.TokenNumber?.updateValueAndValidity();
      }
    }

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.focusout();

    this.doValidate();
  }

  private doValidate() {
    this.notification.initLoadingPopup();

    this.orgTokenAPI
      .validate({
        orgHandle: this.OrgHandle?.value,
        tokenNumber: this.TokenNumber?.value,
        tokenAmount: this.TokenAmount?.value,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          if (res.message !== 'Success') {
            this.TokenNumber?.setErrors({
              serverError: res.message,
            });

            this.notification.close();
            return;
          }

          if (res.status === TokenStatus.PROCESSED || res.status === TokenStatus.REDEEMED) {
            this.TokenNumber?.setErrors({
              serverError: 'Token was already processed',
            });

            this.notification.close();
            return;
          }
          this.notification.close();

          const find = this.listArray.find((o) => {
            return o.tokenNumber === this.TokenNumber?.value;
          });

          if (find) {
            this.TokenNumber?.setErrors({
              serverError: 'Duplicate token',
            });

            return;
          }

          this.gridService.AddListDataItem = {
            donorName: res.donorName,
            status: res.status,
            tokenAmount: +this.TokenAmount?.value,
            tokenNumber: this.TokenNumber?.value,
          };

          this.cleanForm();
        },
        (err) => {
          this.TokenNumber?.setErrors({
            serverError: err.error,
          });

          this.notification.close();
        }
      );
  }

  private cleanForm() {
    const username = this.localStorageData.getLoginUserUserName();
    this.formGroup.reset({
      orgHandle: username,
      tokenNumber: null,
      tokenAmount: null,
    });
    this.isSubmit = false;
    this.formGroup.updateValueAndValidity();
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();

    this.tokenNumInput.nativeElement.focus();
    this.changeDetectorRef.detectChanges();
  }

  onCancel(event?: any) {
    event.preventDefault();
    this.router.navigate(this.pageRoute.getTransactionsRouterLink());
  }

  onProcess() {
    const sub = this.rows$.subscribe((list) => {
      const modalRef = this.notification.initLoadingPopup();

      modalRef.then((res) => {
        if (res.isConfirmed) {
        }
      });

      const tokens = list.map((obj) => {
        return {
          tokenAmount: obj.tokenAmount,
          tokenNumber: obj.tokenNumber,
        };
      });

      this.orgTokenAPI
        .process({
          orgHandle: this.OrgHandle?.value,
          tokens: tokens,
        })
        .subscribe(
          (res) => {
            this.notification.hideLoader();
            if (res.processedTokensCount >= 1) {
              this.localStorageData.setProcessTokenListData([]);
              this.gridService.ListData = [];
            }

            if (res.notProcessedTokensCount < 1) this.notification.displaySuccess('Tokens processed successfully');

            if (res.notProcessedTokensCount && res.notProcessedTokensCount >= 1) {
              const tokenRest = res.processedTokensCount != 0 ? '. The rest were processed successfully' : '';
              const resMessage =
                res.notProcessed != null
                  ? 'Tokens not processed are: ' +
                    res.notProcessed.map((t) => t.tokenNumber + ' - ' + t.message) +
                    tokenRest
                  : '';
              this.notification.throwError(resMessage);
            }
            sub.unsubscribe();
          },
          (err) => {
            this.notification.throwError(err.notProcessed.message);
            sub.unsubscribe();
          }
        );
    });
  }
}
