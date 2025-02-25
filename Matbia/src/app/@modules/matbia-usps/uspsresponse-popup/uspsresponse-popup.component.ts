import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-uspsresponse-popup',
  templateUrl: './uspsresponse-popup.component.html',
  styleUrls: ['./uspsresponse-popup.component.scss'],
  imports: [SharedModule],
})
export class USPSResponsePopupComponent implements OnInit {
  @Input() isAPT = false;

  @Input() isAddress = false;

  // from Response
  @Input() description!: string;

  @Output() continueOnAddress = new EventEmitter();

  /**
   * ### if USPS response is different then input ### start
   */
  @Input() isDifferentResponse = false;

  @Input() address!: string;

  @Input() city!: string;

  @Input() state!: string;

  @Input() zip!: string;

  /**
   * ### if USPS response is different then input ### end
   */

  @Output() continueOnNewAddress = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  onClose() {
    this.activeModal.close(this.description);
  }

  onContinue() {
    this.activeModal.close();
    this.continueOnAddress.emit(true);
  }

  onCloseNew() {
    this.activeModal.close('update');
  }

  onContinueNew() {
    this.activeModal.close();
    this.continueOnNewAddress.emit(true);
  }
}
