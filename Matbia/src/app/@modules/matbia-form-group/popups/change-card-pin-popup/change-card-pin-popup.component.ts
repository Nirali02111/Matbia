import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { shakeTrigger } from '@commons/animations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import { CardPinInputComponent } from '@matbia/matbia-input/card-pin-input/card-pin-input.component';

@Component({
  selector: 'app-change-card-pin-popup',
  templateUrl: './change-card-pin-popup.component.html',
  styleUrls: ['./change-card-pin-popup.component.scss'],
  imports: [SharedModule, CardPinInputComponent],
  animations: [shakeTrigger],
})
export class ChangeCardPinPopupComponent implements OnInit {
  CVVMASK = '0000';

  inAnimation = false;
  formGroup!: FormGroup;

  @Output() newValue: EventEmitter<string> = new EventEmitter();

  get CVV() {
    return this.formGroup.get('cvv');
  }

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      cvv: this.fb.control(null, Validators.compose([Validators.required])),
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  onSave() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    this.newValue.emit(this.CVV?.value);
    this.closePopup();
  }
}
