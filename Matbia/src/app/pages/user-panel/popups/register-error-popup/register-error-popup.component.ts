import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@matbia/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-error-popup',
  templateUrl: './register-error-popup.component.html',
  styleUrl: './register-error-popup.component.css',
  imports: [SharedModule],
})
export class RegisterErrorPopupComponent {
  @Input() email!: string;

  constructor(public activeModal: NgbActiveModal, private router: Router, private pageRoute: PageRouteVariable) {}
  ngOnInit() {}

  closePopup() {
    this.activeModal.dismiss();
  }

  goToLogin() {
    this.closePopup();
    this.router.navigate(['/auth/login']);
  }

  continueWithNewAccount() {
    Swal.fire({
      text: 'Please change the email on the application',
      icon: 'error',
      customClass: {
        container: 'custom-alert-popup',
      },
    });
    this.closePopup();
  }
}
