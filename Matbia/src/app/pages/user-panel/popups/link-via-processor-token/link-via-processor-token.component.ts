import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-link-via-processor-token',
  templateUrl: './link-via-processor-token.component.html',
  styleUrls: ['./link-via-processor-token.component.scss'],
  imports: [SharedModule],
})
export class LinkViaProcessorTokenComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.dismiss();
  }
}
