import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PageRouteVariable } from '@commons/page-route-variable';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-redeem-donation-popup',
  templateUrl: './redeem-donation-popup.component.html',
  styleUrls: ['./redeem-donation-popup.component.scss'],
  imports: [SharedModule],
})
export class RedeemDonationPopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal, private router: Router, private pageRoute: PageRouteVariable) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.close();
  }

  goToAccounts() {
    this.closePopup();
    this.router.navigate(this.pageRoute.getAccountsRouterLink());
  }

  goToConnectToBank() {
    this.closePopup();
    this.router.navigate(this.pageRoute.getLinkNewAccountRouterLink());
  }
}
