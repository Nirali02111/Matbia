import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-after-donation-popup',
  templateUrl: './after-donation-popup.component.html',
  styleUrls: ['./after-donation-popup.component.scss'],
  imports: [SharedModule],
})
export class AfterDonationPopupComponent implements OnInit {
  @Input() amount = 0;

  @Input() organization = '';

  @Input() startDate = '';

  @Input() endDate = '';

  @Input() totalAmount = 0;

  @Input() frequency = '';

  @Input() count = 0;

  /**
   * If Donation is Recurring
   */
  @Input() isRecurring = false;

  @Input() isError = false;

  @Input() errorMessage = '';

  /**
   * for checking if it's inside panel then allow redirect to dashboard
   */
  @Input() isInsidePanel = true;

  @Output() emtOnConfirm: EventEmitter<boolean> = new EventEmitter();

  constructor(private router: Router, public activeModal: NgbActiveModal, private pageRoute: PageRouteVariable) {}

  ngOnInit(): void {}

  isNoFundsError() {
    return this.errorMessage === 'Insufficient funds';
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onConfirmClick() {
    this.emtOnConfirm.emit(true);
    this.closePopup();
  }

  goToOverview() {
    if (this.isInsidePanel) {
      this.router.navigate(this.pageRoute.getDashboardRouterLink());
    }
    this.closePopup();
  }

  goToAddFunds() {
    if (this.isInsidePanel) {
      this.router.navigate(this.pageRoute.getAddFundsRouterLink());
    }
    this.closePopup();
  }
}
