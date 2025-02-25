import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  AfterContentInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-cancel-donation-popup',
  templateUrl: './cancel-donation-popup.component.html',
  styleUrls: ['./cancel-donation-popup.component.scss'],
  imports: [SharedModule],
})
export class CancelDonationPopupComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  @Input() isConfirmation = true;

  @Input() isRefund = false;

  @Input() errorResponse = '';

  @Input() successResponse = '';

  @Input() amount!: number;

  @Input() isRedeem = false;

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

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  onConfirm() {
    this.confirm.emit(true);
    this.activeModal.close();
  }

  simpleClose() {
    this.activeModal.close();
  }
}
