import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-upload-bank-statement-popup',
  templateUrl: './upload-bank-statement-popup.component.html',
  styleUrls: ['./upload-bank-statement-popup.component.scss'],
  imports: [SharedModule],
})
export class UploadBankStatementPopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  onClose() {
    this.activeModal.close();
  }
}
