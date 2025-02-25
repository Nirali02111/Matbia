import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { CustomValidator } from '@commons/custom-validator';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NotificationService } from '@commons/notification.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { OrganizationTransactionAPIService } from '@services/API/organization-transaction-api.service';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';

import { ProcessCardConfirmPopupComponent } from '../process-card-confirm-popup/process-card-confirm-popup.component';
import { AfterCardConfirmPopupComponent } from '../after-card-confirm-popup/after-card-confirm-popup.component';

import { SharedModule } from '@matbia/shared/shared.module';
import { RecurringFormGroupComponent } from '@matbia/matbia-form-group/recurring-form-group/recurring-form-group.component';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';
import { CardExpiryInputComponent } from '@matbia/matbia-input/card-expiry-input/card-expiry-input.component';

@Component({
  selector: 'app-process-card-view',
  templateUrl: './process-card-view.component.html',
  styleUrls: ['./process-card-view.component.scss'],
  imports: [
    SharedModule,
    RecurringFormGroupComponent,
    AmountInputComponent,
    ButtonLoaderComponent,
    CreditCardInputComponent,
    CardExpiryInputComponent,
  ],
})
export class ProcessCardViewComponent implements OnInit, AfterContentInit, OnDestroy, AfterViewInit {
  isLoading = false;

  processCardFormGroup!: UntypedFormGroup;

  @ViewChild(AmountInputComponent, { static: false }) amountInput!: AmountInputComponent;

  @ViewChild('expInput') expInput!: CardExpiryInputComponent;
  constructor(
    protected title: Title,
    private fb: UntypedFormBuilder,
    private router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private localStorage: LocalStorageDataService,
    private pageRoute: PageRouteVariable,
    private transactionAPI: OrganizationTransactionAPIService,
    private notification: NotificationService,
    private modalService: NgbModal
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Process card');
    this.initForm();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.amountInput) {
      this.amountInput.doFocus();
    }
  }

  private initForm() {
    this.processCardFormGroup = this.fb.group({
      isRecurring: this.fb.control(false),
      isDonate: this.fb.control(true),
      amount: this.fb.control(
        null,
        Validators.compose([
          Validators.required,
          CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
        ])
      ),
      cardNum: this.fb.control(null, Validators.compose([Validators.required])),
      exp: this.fb.control(null, Validators.compose([Validators.required])),
      note: this.fb.control(''),
      transDate: this.fb.control(null, Validators.compose([Validators.required])),
      isNotifyOnEmail: this.fb.control(true),
      isNotifyOnSMS: this.fb.control(false),
      recurringPayment: this.fb.group({
        count: this.fb.control(null),
        amount: this.fb.control(null),
        frequency: this.fb.control(null),
        alwaysRecurring: this.fb.control(false),
      }),
    });
  }

  ngOnDestroy(): void {}

  onProcessCard() {
    if (this.processCardFormGroup.invalid) {
      this.processCardFormGroup.markAllAsTouched();
      return;
    }
    setTimeout(() => {
      const modalRef = this.modalService.open(ProcessCardConfirmPopupComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'donate-popup',
        size: 'lg',
        scrollable: true,
      });
      const value = this.processCardFormGroup.value;
      modalRef.componentInstance.amount = +value.amount;
      modalRef.componentInstance.cardNum = value.cardNum;
      modalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
        if (val) {
          this.doProcessing();
        }
      });
    }, 0);
  }

  private doProcessing() {
    const value = this.processCardFormGroup.value;
    const businessHandle = this.localStorage.getLoginUserUserName();

    let apiData = {
      orgHandle: businessHandle,
      amount: +value.amount,
      transDate: value.transDate?.startDate,
      cardNum: value.cardNum,
      exp: value.exp,
      note: value.note,
    };

    if (value.isRecurring) {
      const { isRecurring, ...resetValues } = value;
      apiData = {
        ...resetValues,
        amount: resetValues.recurringPayment.alwaysRecurring ? apiData.amount : +resetValues.recurringPayment?.amount,
        transDate: null,
        orgHandle: businessHandle,
        recurringPayment: {
          ...resetValues.recurringPayment,
          count: resetValues.recurringPayment.alwaysRecurring ? -1 : +resetValues.recurringPayment?.count,
          amount: resetValues.recurringPayment.alwaysRecurring ? apiData.amount : +resetValues.recurringPayment?.amount,
          scheduleDate: value.transDate?.startDate,
        },
      };
    }

    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
        return;
      }
    });

    this.transactionAPI.matbiaCardDonation(apiData).subscribe(
      (res) => {
        this.notification.hideLoader();

        if (res.donaryErrorResponse) {
          this.notification.displayError(res.donaryErrorResponse);
          return;
        }

        if (!res.gatewayResponse) {
          this.notification.displayError(res.status);
          return;
        }

        if (res.gatewayResponse?.errors.length !== 0) {
          this.notification.displayError(res.gatewayResponse?.errors[0].error);
          return;
        }

        if (res.error && res.error.length !== 0) {
          this.notification.displayError(res?.error[0].error);
          return;
        }

        this.notification.close();
        const modalRef = this.modalService.open(AfterCardConfirmPopupComponent, {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'donate-popup',
          size: 'lg',
          scrollable: true,
        });
        modalRef.componentInstance.amount = +value.amount;
        modalRef.componentInstance.emtCardConfirm.subscribe((res: boolean) => {
          if (res) {
            this.processCardFormGroup.reset();
          }
        });
      },
      (err) => {
        this.notification.throwError(err.error);
      }
    );
  }

  focusExpInput() {
    this.expInput.focus();
  }
}
