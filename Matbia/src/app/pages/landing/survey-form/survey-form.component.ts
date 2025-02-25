import { Component, HostListener } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrl: './survey-form.component.css',
  imports: [SharedModule],
})
export class SurveyFormComponent {
  isFormSubmitted: boolean = false;

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.data && event.data.action) {
      this.isFormSubmitted = true;
    }
  }
}
