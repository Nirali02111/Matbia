import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.scss'],
  imports: [SharedModule],
})
export class ErrorPopupComponent implements OnInit {
  @Input() amount = 0;

  @Input() organization = '';

  @Input() isError = true;

  @Input() errorMessage = 'ERROR';
  @Input() error = '';

  @Output() emtOnConfirm: EventEmitter<boolean> = new EventEmitter();

  constructor(private router: Router, public activeModal: NgbActiveModal, private pageRoute: PageRouteVariable) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.dismiss();
  }

  onConfirmClick() {
    this.emtOnConfirm.emit(true);
    this.closePopup();
  }

  goToOverview() {
    this.router.navigate(this.pageRoute.getDashboardRouterLink());
    this.closePopup();
  }

  goToAddFunds() {
    this.router.navigate(this.pageRoute.getAddFundsRouterLink());
    this.closePopup();
  }
}
