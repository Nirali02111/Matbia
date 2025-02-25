import { Component, OnInit, Output, Input, EventEmitter, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-cancel-deposit-popup',
  templateUrl: './cancel-deposit-popup.component.html',
  styleUrls: ['./cancel-deposit-popup.component.scss'],
  imports: [SharedModule],
})
export class CancelDepositPopupComponent implements OnInit, AfterContentInit {
  @Input() isConfirmation = true;

  @Input() amount!: number;

  @Output() confirm: EventEmitter<boolean> = new EventEmitter();
  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  constructor(private readonly changeDetectorRef: ChangeDetectorRef, private activeModal: NgbActiveModal) {}

  closePopup() {
    this.activeModal.close();
    if (!this.isConfirmation) {
      this.refresh.emit(true);
    }
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  onConfirm() {
    this.confirm.emit(true);
    this.activeModal.close();
  }

  simpleClose() {
    this.activeModal.close();
  }
}
