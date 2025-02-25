import { Component, HostListener, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-help-and-feedback',
  templateUrl: './help-and-feedback.component.html',
  styleUrls: ['./help-and-feedback.component.scss'],
  imports: [SharedModule],
})
export class HelpAndFeedbackComponent implements OnInit {
  constructor() {}

  isFormSubmitted: boolean = false;
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.data && event.data.action) {
      this.isFormSubmitted = true;
    }
  }
  ngOnInit(): void {}
}
