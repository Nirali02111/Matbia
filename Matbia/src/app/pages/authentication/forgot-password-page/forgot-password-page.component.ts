import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@commons/notification.service';
import { AuthService } from '@services/API/auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css',
  imports: [SharedModule],
})
export class ForgotPasswordPageComponent {
  constructor(
    private recaptchaV3Service: ReCaptchaV3Service,
    private notificationService: NotificationService,
    public authService: AuthService,
    private router: Router
  ) {}
  txtForgotEmail = '';
  isLoading = false;
  tmpName: string = 'showForgotPassword';
  sendResetLink() {
    if (this.txtForgotEmail) {
      this.recaptchaV3Service.execute('ForgotPassword').subscribe(
        (token) => this.sendResetLinkAction(token),
        () => {
          this.isLoading = false;
          this.notificationService.showError('Sorry', 'Error !');
        }
      );
    } else {
      this.notificationService.showError('Please Enter valid email', 'Error !');
    }
  }

  sendResetLinkAction(token: string) {
    this.isLoading = true;
    this.authService.forgotPassword(this.txtForgotEmail, token).subscribe(
      (res: any) => {
        // hide loader
        this.isLoading = false;
        this.txtForgotEmail = '';
        if (res) {
          this.tmpName = 'sendResetLink';
        }
      },
      (error) => {
        this.isLoading = false;
        this.notificationService.showError(error.error, 'Error !');
      }
    );
  }

  openEmail() {
    window.location.href = 'https://mail.google.com/mail/u/0/#inbox';
  }

  tryAnotherMail(event: Event) {
    event.preventDefault();
    this.tmpName = 'showForgotpassword';
    this.txtForgotEmail = '';
  }

  backToSignIn(event: Event) {
    event.preventDefault();
    this.notificationService.clearAllToaster();
    this.router.navigate(['/']);
  }
}
