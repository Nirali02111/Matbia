import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PageRouteVariable } from '@commons/page-route-variable';
import { PanelPopupsService } from 'src/app/pages/user-panel/popups/panel-popups.service';
import { DonationRequestObj } from 'src/app/models/panels';
import { RequestStatus } from '@enum/Request';
import { NotificationService } from '@commons/notification.service';
import { DonationRequestAPIService } from '@services/API/donation-request-api.service';
import { Assets } from '@enum/Assets';

import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '@commons/custom-validator';

import { SharedModule } from '@matbia/shared/shared.module';
import { AmountInputComponent } from '@matbia/matbia-input/amount-input/amount-input.component';

@Component({
  selector: 'app-request-row-item',
  templateUrl: './request-row-item.component.html',
  styleUrls: ['./request-row-item.component.scss'],
  imports: [SharedModule, AmountInputComponent],
})
export class RequestRowItemComponent implements OnInit {
  isCollapsed = true;

  isDevEnv = false;
  editRequestRowForm: FormGroup = new FormGroup({});
  noteFieldActive: boolean = false;

  @Input() item!: DonationRequestObj;
  @Input() orgitem: any;
  @Input() hideAmountColumn = true;
  @Input() isMobile = false;
  @Input() isRequest = false;
  @Input() set selectedRequest(requests: any[]) {
    let reqWithUpdatedAmount = requests.find((req) => req.donationRequestId == this.item.donationRequestId);
    if (reqWithUpdatedAmount) {
      this.donationAmount.setValue(reqWithUpdatedAmount.donationAmount);
    }
  }

  private _isBulkDonate: boolean = false;
  @Input() set isBulkDonate(value: boolean) {
    this._isBulkDonate = value;
    if (this._isBulkDonate) this.resetValues();
  }
  get isBulkDonate() {
    return this._isBulkDonate;
  }

  @Input() set selectAll(value: boolean) {
    this.selectedStatus?.setValue(value);
  }

  @Output() refresh = new EventEmitter();
  @Output() addRequest: EventEmitter<any> = new EventEmitter();

  profileIcon = Assets.PROFILE_IMAGE;

  get isFulFilled(): boolean {
    return this.item.status === RequestStatus.FULFILLED;
  }

  get isPending(): boolean {
    return this.item.status === RequestStatus.PENDING;
  }

  get isDismissed(): boolean {
    return this.item.status === RequestStatus.DISMISSED;
  }

  get isSnoozed(): boolean {
    return this.item.status === RequestStatus.SNOOZED;
  }

  get selectedStatus(): AbstractControl<any> {
    return this.editRequestRowForm.get('selected') as AbstractControl;
  }

  get donationAmount(): AbstractControl<any> {
    return this.editRequestRowForm.get('donationAmount') as AbstractControl;
  }

  get note(): AbstractControl<any> {
    return this.editRequestRowForm.get('note') as AbstractControl;
  }

  constructor(
    private pageRoute: PageRouteVariable,
    private popupService: PanelPopupsService,
    private notification: NotificationService,
    private donationRequestAPI: DonationRequestAPIService,
    private panelPopupService: PanelPopupsService,
    private matbiaObserver: MatbiaObserverService,
    private fb: FormBuilder
  ) {}

  statusClass(status: any) {
    if (status == 'All') {
      return '';
    }
    if (status == 'Pending') {
      return 'open-badge';
    }
    if (status == 'FulFilled') {
      return 'sent-badge';
    }

    if (status == 'Snoozed') {
      return 'dismissed-badge';
    }
    return '';
  }

  ngOnInit(): void {
    this.initializeRequestFormGroup();

    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });

    this.selectedStatus.valueChanges.subscribe(() => {
      this.editRequestRowForm.updateValueAndValidity();
      this.addRequest.emit({
        ...this.editRequestRowForm.value,
        orgName: this.item.orgName,
        orgLogo: this.item.orgLogo,
      });
    });

    this.donationAmount.valueChanges.subscribe(() => {
      this.editRequestRowForm.updateValueAndValidity();
      if (this.selectedStatus.value) this.addRequest.emit(this.editRequestRowForm.value);
      this.donationAmount?.setValidators(
        Validators.compose([
          Validators.required,
          CustomValidator.greaterThan(0.25, true, 'Starting amount is $0.25', true),
        ])
      );
    });

    this.note.valueChanges.subscribe(() => {
      this.editRequestRowForm.updateValueAndValidity();
      if (this.selectedStatus.value) this.addRequest.emit(this.editRequestRowForm.value);
    });
  }

  initializeRequestFormGroup() {
    this.editRequestRowForm = this.fb.group({
      donationRequestId: this.item.donationRequestId,
      donationAmount: this.item.amount,
      note: '',
      selected: false,
    });
  }

  onDismissed() {
    this.doUpdate(RequestStatus.DISMISSED, new Date().toISOString());
  }

  OpenReminder(event: any) {
    event.preventDefault();
    const modalRef = this.popupService.openSetReminder();
    modalRef.componentInstance.setSnoozeDate.subscribe((val: string) => {
      this.doUpdate(RequestStatus.SNOOZED, val);
    });
  }

  private doUpdate(status: string, snoozeDate: string) {
    const loader = this.notification.initLoadingPopup();
    loader.then((res) => {
      if (res.isConfirmed) {
        this.refresh.emit(true);
      }
    });

    this.donationRequestAPI
      .updateStatus({
        donationRequestId: this.item.donationRequestId,
        status,
        snoozeDate,
        donationRequestIds: [],
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }

  getSendMoneyLink() {
    return [...this.pageRoute.getRequestsRouterLink(), this.item.orgId, 'request-details', this.item.donationRequestId];
  }

  openDonationHistoryPopup() {
    const modalRef = this.panelPopupService.openDonationHistoryPopup();

    modalRef.componentInstance.encryptedOrganizationId = this.item.orgId;
    modalRef.componentInstance.orgName = this.item.orgName;
    modalRef.componentInstance.campaignName = this.item.collector;
  }

  isSourceToken(method: string | null | undefined): boolean {
    return !!method && method.includes('Token');
  }

  transformType(method: string | null) {
    if (method) {
      if (this.isSourceToken(method)) {
        let transformed = method.replace('Expired Token, #', 'Token ');
        return transformed;
      } else {
        let transformed = method.replace('*', '...');
        return transformed;
      }
    }
    return method;
  }

  resetValues() {
    if (this.editRequestRowForm) {
      this.donationAmount?.setValue(this.item.amount);
      this.note?.setValue('');
      this.selectedStatus?.setValue(false);
    }
  }
}
