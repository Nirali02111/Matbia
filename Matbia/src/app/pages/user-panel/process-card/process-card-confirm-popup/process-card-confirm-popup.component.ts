import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import { DisplayLastPipe } from '@matbia/matbia-pipes/display-last.pipe';

@Component({
  selector: 'app-process-card-confirm-popup',
  templateUrl: './process-card-confirm-popup.component.html',
  styleUrls: ['./process-card-confirm-popup.component.scss'],
  imports: [SharedModule, DisplayLastPipe],
})
export class ProcessCardConfirmPopupComponent implements OnInit {
  @Input() amount = 0;

  @Input() cardNum = '';

  @Output() emtOnConfirm: EventEmitter<boolean> = new EventEmitter();
  modalOptions: NgbModalOptions = {
    centered: true,
    backdrop: 'static',
    keyboard: false,
    windowClass: 'drag_popup',
    size: 'xl',
    scrollable: true,
  };
  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

  ngOnInit(): void {
    const clikButton = document.getElementById("clickButton")
    if(clikButton){clikButton.focus();}
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  getUSDAmount() {
    return this.amount;
  }

  onConfirmClick() {
    this.emtOnConfirm.emit(true);
    this.closePopup();
  }
  openTerms(event: any) {
    event.preventDefault();
    this.modalService.open(TermsOfServicePopupComponent, this.modalOptions);
  }
}
