import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-delete-bank-account-confirm-popup',
  templateUrl: './delete-bank-account-confirm-popup.component.html',
  styleUrls: ['./delete-bank-account-confirm-popup.component.scss'],
  imports: [SharedModule],
})
export class DeleteBankAccountConfirmPopupComponent implements OnInit {
  @Input() accountName = '';

  @Input() accountNumber = '';

  @Input() accountType = '';

  @Output() proceed = new EventEmitter();

  @Output() schedulesToOther = new EventEmitter();

  constructor(public activeModal: NgbActiveModal, private router: Router, private pageRoute: PageRouteVariable) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.dismiss();
  }

  goToLinkAccount() {
    this.router.navigate(this.pageRoute.getLinkNewAccountRouterLink());
    this.closePopup();
  }

  deleteOthers() {
    this.schedulesToOther.emit(true);
    this.closePopup();
  }

  onConfirmClick() {
    this.proceed.emit(true);
    this.closePopup();
  }
}
