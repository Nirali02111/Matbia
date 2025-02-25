import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Assets } from '@enum/Assets';
import { TransactionStatus } from '@enum/Transaction';
import { CustomValidator } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';

import { CardExpiryInputComponent } from '@matbia/matbia-input/card-expiry-input/card-expiry-input.component';
import { RecurringFormGroupComponent } from '@matbia/matbia-form-group/recurring-form-group/recurring-form-group.component';
import { AfterDonationPopupComponent } from '@matbia/matbia-shared-popup/after-donation-popup/after-donation-popup.component';
import { AddBalanceConfirmPopupComponent } from '@matbia/matbia-form-group/popups/add-balance-confirm-popup/add-balance-confirm-popup.component';

import { DonateAPIService, DonateOrgObj } from '@services/API/donate-api.service';
import { MatbiaAPIService } from '@services/API/matbia-api.service';
import { TransactionRecurrenceObj } from 'src/app/models/common-api-model';

import { distinctUntilChanged } from 'rxjs/operators';

import { SharedModule } from '@matbia/shared/shared.module';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';
import { CreditCardInputComponent } from '@matbia/matbia-input/credit-card-input/credit-card-input.component';

@Component({
  selector: 'app-donate-to-organization',
  templateUrl: './donate-to-organization.component.html',
  styleUrls: ['./donate-to-organization.component.scss'],
  imports: [SharedModule, RecurringFormGroupComponent, CardExpiryInputComponent, AmountInputComponent, CreditCardInputComponent],
})
export class DonateToOrganizationComponent implements OnInit, AfterViewInit {
  processCardFormGroup!: UntypedFormGroup;

  organization!: DonateOrgObj;

  profileIcon = Assets.PROFILE_IMAGE;

  cardExp = 'M9/00';

  transactionRecurrences: Array<TransactionRecurrenceObj> = [
    {
      id: 1,
      name: 'Daily',
      description: '',
    },
    {
      id: 2,
      name: 'Weekly',
      description: '',
    },
    {
      id: 3,
      name: 'Bi-Weekly',
      description: '',
    },
    {
      id: 4,
      name: 'Monthly',
      description: '',
    },
    {
      id: 5,
      name: 'Annually',
      description: '',
    },
  ];

  get OrgId() {
    return this.processCardFormGroup.get('orgId');
  }

  get Recurring() {
    return this.processCardFormGroup.get('isRecurring');
  }

  get CardNumber() {
    return this.processCardFormGroup.get('cardNum');
  }

  get CardExp() {
    return this.processCardFormGroup.get('exp');
  }

  get Note() {
    return this.processCardFormGroup.get('note');
  }

  get TransDate() {
    return this.processCardFormGroup.get('transDate');
  }

  get Amount() {
    return this.processCardFormGroup.get('amount');
  }

  get RecurringPayment() {
    return this.processCardFormGroup.get('recurringPayment');
  }

  get RecurringCount() {
    return this.RecurringPayment?.get('count');
  }

  get RecurringFrequency() {
    return this.RecurringPayment?.get('frequency');
  }

  get AlwaysRecurring() {
    return this.RecurringPayment?.get('alwaysRecurring');
  }

  get isAlwaysRecurring() {
    return +this.RecurringCount?.value === 0;
  }

  @ViewChild(RecurringFormGroupComponent, { static: false }) recurringComponent!: RecurringFormGroupComponent;

  @ViewChild(CardExpiryInputComponent, { static: true }) cardExpiryInputComponent!: CardExpiryInputComponent;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NotificationService,
    private donateAPI: DonateAPIService,
    private matbiaAPI: MatbiaAPIService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.initForm();

    this.OrgId?.valueChanges.subscribe((val) => {
      if (!val) {
        return;
      }

      this.getOrgDetails();
    });

    this.activeRoute.paramMap.subscribe((params) => {
      const orgId = params.get('orgId');
      this.OrgId?.patchValue(orgId);
      this.processCardFormGroup.updateValueAndValidity();
    });
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();

    this.CardNumber?.statusChanges.pipe(distinctUntilChanged()).subscribe((val) => {
      if (val === 'VALID' && !this.CardExp?.value) {
        this.cardExpiryInputComponent.doFocus();
      }
    });
  }

  private initForm() {
    this.processCardFormGroup = this.fb.group({
      orgId: this.fb.control(null, Validators.compose([Validators.required])),
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

  private getOrgDetails() {
    this.donateAPI.get(this.OrgId?.value).subscribe(
      (res) => {
        this.organization = res;
      },
      () => {}
    );
  }

  goToAuth() {
    this.router.navigate(['/auth/login'], {
      queryParams: {
        returnUrl: `/dashboard/donate/${this.organization.orgEncryptedOrgId}/donate`,
      },
    });
  }

  onSubmit() {
    if (this.processCardFormGroup.invalid) {
      this.processCardFormGroup.markAllAsTouched();
      return;
    }

    const modalRef = this.openConfirmation();

    modalRef.componentInstance.emtOnConfirm.subscribe((val: any) => {
      if (!val) {
        return;
      }

      if (this.Recurring?.value) {
        this.doSchedule();
        return;
      }

      this.doCharge();
    });
  }

  openConfirmation(): NgbModalRef {
    const modalRef = this.modalService.open(AddBalanceConfirmPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'donate-funds-confirm-popup donate-popup modal-funds add-funds-confirm-popup',
      size: 'md',
      scrollable: true,
    });

    modalRef.componentInstance.amount = this.Amount?.value;
    modalRef.componentInstance.organization = this.organization.businessName;

    modalRef.componentInstance.isDeposit = false;

    if (this.Recurring?.value) {
      modalRef.componentInstance.isRecurring = this.Recurring?.value;
      modalRef.componentInstance.frequency = this.recurringComponent.transactionRecurrences.find(
        (o) => o.id === this.RecurringFrequency?.value
      )?.name;

      modalRef.componentInstance.totalAmount = this.recurringComponent.displayTotal();

      if (!this.isAlwaysRecurring) {
        modalRef.componentInstance.startDate = this.recurringComponent.previewList[0].date;
        modalRef.componentInstance.endDate = this.recurringComponent.previewListLast[0].date;
        modalRef.componentInstance.count = this.RecurringCount?.value;
      }

      if (this.isAlwaysRecurring) {
        modalRef.componentInstance.startDate = this.recurringComponent.previewList[0].date;
        modalRef.componentInstance.endDate = null;
        modalRef.componentInstance.totalAmount = this.Amount?.value;
        modalRef.componentInstance.count = -1;
      }
    }

    return modalRef;
  }

  private doCharge() {
    this.notification.initLoadingPopup();
    const payload = {
      orgUserHandle: this.organization.orgHandle,
      orgTaxId: this.organization.taxId,
      orgName: this.organization.businessName,
      orgEmail: this.organization.email,
      orgPhoneNumber: this.organization.phone,
      orgStreet: this.organization.address,
      orgCity: this.organization.city,
      orgState: this.organization.state,
      orgZip: this.organization.zip,
      cardNum: this.CardNumber?.value,
      exp: this.CardExp?.value,
      amount: this.Amount?.value,
      transDate: this.TransDate?.value.startDate,
      note: this.Note?.value,
      externalTransactionId: null,
      externalCharityID: null,
      feeAmount: null,
      tipAmount: null,
    };

    this.matbiaAPI.charge(payload).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.close();
        const modalRef = this.modalService.open(AfterDonationPopupComponent, {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'after-donation-popup donate-popup modal-funds',
          size: 'md',
          scrollable: true,
        });

        modalRef.componentInstance.amount = payload.amount;
        modalRef.componentInstance.organization = payload.orgName;

        modalRef.componentInstance.isInsidePanel = false;

        if (res.status === TransactionStatus.SUCCESS) {
          modalRef.componentInstance.isSuccess = true;

          modalRef.dismissed.subscribe(() => {
            window.location.reload();
          });

          return;
        }

        if (res.error) {
          this.errorCheck(modalRef, res);
          return;
        }
      },
      (err) => {
        this.notification.throwError(err.error.error);
      }
    );
  }

  private doSchedule() {
    this.notification.initLoadingPopup();
    const payload = {
      orgUserHandle: this.organization.orgHandle,
      orgTaxId: this.organization.taxId,
      orgName: this.organization.businessName,
      orgEmail: this.organization.email,
      cardNum: this.CardNumber?.value,
      exp: this.CardExp?.value,
      amountPerPayment: this.Amount?.value,
      scheduleStartDate: this.TransDate?.value.startDate,
      count: this.isAlwaysRecurring ? -1 : +this.RecurringCount?.value,
      frequency: this.RecurringFrequency?.value,
      note: this.Note?.value,
    };

    this.matbiaAPI.schedule(payload).subscribe(
      (res) => {
        this.notification.hideLoader();
        this.notification.close();

        const modalRef = this.modalService.open(AfterDonationPopupComponent, {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'after-donation-popup donate-popup modal-funds',
          size: 'md',
          scrollable: true,
        });

        modalRef.componentInstance.amount = payload.amountPerPayment;
        modalRef.componentInstance.organization = payload.orgName;
        modalRef.componentInstance.isRecurring = true;
        modalRef.componentInstance.totalAmount = this.recurringComponent.displayTotal();
        modalRef.componentInstance.isInsidePanel = false;

        modalRef.componentInstance.frequency = this.recurringComponent.transactionRecurrences.find(
          (o) => o.id === payload.frequency
        )?.name;

        if (!this.isAlwaysRecurring) {
          modalRef.componentInstance.startDate = this.recurringComponent.previewList[0].date;
          modalRef.componentInstance.endDate = this.recurringComponent.previewListLast[0].date;
          modalRef.componentInstance.count = payload.count;
        }

        if (this.isAlwaysRecurring) {
          modalRef.componentInstance.startDate = this.recurringComponent.previewList[0].date;
          modalRef.componentInstance.endDate = null;
          modalRef.componentInstance.totalAmount = this.recurringComponent.displayTotal();
          modalRef.componentInstance.count = -1;
        }

        if (res.status === TransactionStatus.SUCCESS) {
          modalRef.componentInstance.isSuccess = true;

          modalRef.dismissed.subscribe(() => {
            window.location.reload();
          });
          return;
        }

        if (res.error) {
          this.errorCheck(modalRef, res);
          return;
        }
      },
      (err) => {
        this.notification.throwError(err.error.error);
      }
    );
  }

  private errorCheck(modalRef: NgbModalRef, res: any) {
    modalRef.componentInstance.isError = true;
    if (res.error === 'Insufficient wallet balance') {
      modalRef.componentInstance.errorMessage = 'Insufficient funds';
      return;
    }
    modalRef.componentInstance.errorMessage = res.error;
    return;
  }
}
