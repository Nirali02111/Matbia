import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-pdfview-popup',
  templateUrl: './pdfview-popup.component.html',
  styleUrls: ['./pdfview-popup.component.scss'],
  imports: [SharedModule],
})
export class PDFViewPopupComponent implements OnInit {
  isLoading = true;
  fileUrl!: SafeResourceUrl;

  @Input() title = 'Print';

  @Input() set pdfUrl(value: string) {
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value);
    this.isLoading = false;
  }

  constructor(public activeModal: NgbActiveModal, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  closePopup() {
    this.activeModal.dismiss();
  }
}
