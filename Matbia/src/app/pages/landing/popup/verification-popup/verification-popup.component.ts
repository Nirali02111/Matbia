import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-verification-popup',
  templateUrl: './verification-popup.component.html',
  styleUrls: ['./verification-popup.component.scss'],
  imports: [SharedModule],
})
export class VerificationPopupComponent implements OnInit {
  @Input() isLoading = true;

  @Input() email = '';

  @Output() continue = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  onClose() {
    this.activeModal.close();
  }

  onContinue() {
    this.continue.emit(true);
    this.onClose();
  }
}
