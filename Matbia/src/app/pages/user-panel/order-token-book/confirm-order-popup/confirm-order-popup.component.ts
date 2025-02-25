import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PageRouteVariable } from '@commons/page-route-variable';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-confirm-order-popup',
  templateUrl: './confirm-order-popup.component.html',
  styleUrls: ['./confirm-order-popup.component.scss'],
  imports: [SharedModule],
})
export class ConfirmOrderPopupComponent implements OnInit {
  @Input() totalAmout = 0;
  @Input() donarInfo = '';
  @Output() emtOnConfirm: EventEmitter<boolean> = new EventEmitter();
  constructor(
    public activeModal: NgbActiveModal,
    private pageRoute: PageRouteVariable,
    private localStorageDataService: LocalStorageDataService
  ) {}

  ngOnInit(): void {}

  getProfileRouterLink() {
    return this.pageRoute.getProfileRouterLink();
  }

  closePopup() {
    this.activeModal.dismiss();
  }
  onConfirmClick() {
    this.emtOnConfirm.emit(true);
    this.closePopup();
  }
  redirectFromVouche() {
    this.localStorageDataService.setIsRedirectFromVoucherPage('true');
    this.closePopup();
  }
}
