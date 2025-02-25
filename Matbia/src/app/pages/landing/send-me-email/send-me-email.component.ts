import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { AuthService } from '@services/API/auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-send-me-email',
  templateUrl: './send-me-email.component.html',
  styleUrl: './send-me-email.component.css',
  imports: [SharedModule],
})
export class SendMeEmailComponent {
  tmpName: string = 'setupPassword';
  accountemail: any = null;
  cardValueFromEmail: any;
  showValidatecard: boolean = false;
  isRedirectFromSignUp: any;
  cardOrEmailValue: string = '';
  private _forgotPassSubscriptions: Subscription = new Subscription();
  type: any;
  SignUpcardNum: any;

  constructor(
    private authService: AuthService,
    private localStorageDataService: LocalStorageDataService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cardOrEmailValue = this.localStorageDataService.getUserCardOrEmailValue().cardOrEmailValue;
    this.cardValueFromEmail = this.localStorageDataService.getUserCardOrEmailValue().cardValueFromEmail;
    if (history.state && history.state.tmpName == 'checkEmailTmp2') {
      this.tmpName = 'checkEmailTmp2';
      this.accountemail = history.state.accountemail;
      if (history.state.showValidatecard) {
        this.showValidatecard = history.state.showValidatecard;
      }
      if (history.state.SignUpcardNum) {
        this.SignUpcardNum = history.state.SignUpcardNum;
      }
      if (history.state.isRedirectFromSignUp) {
        this.isRedirectFromSignUp = history.state.isRedirectFromSignUp;
      }
      if (history.state.type) {
        this.type = history.state.type;
      }
    }
  }

  openEmail() {
    window.location.href = 'https://mail.google.com/mail/u/0/#inbox';
  }

  sendEmail() {
    if (this.isRedirectFromSignUp) {
      const { cardId, pin, email } = this.isRedirectFromSignUp;

      this.authService
        .matbiaCardLogin({ cardId: cardId, pin: pin })
        .pipe(
          map((data: any) => {
            this.localStorageDataService.setLoginUserDataAndToken(data);
            return data;
          }),
          switchMap((data: any) => {
            return this.authService.SetPassword({
              email: email,
              userHandle: data.userName,
            });
          })
        )
        .subscribe({
          next: (val) => {
            if (val) {
              this.localStorageDataService.setSendEmailCardValue(email);
              this.tmpName = 'checkEmail';
            }
          },
          error: (err) => {
            this.notificationService.showError(err.error, 'Error !');
          },
        });
    } else {
      const obj = {
        email: this.cardOrEmailValue ? this.cardOrEmailValue : this.accountemail,
        userHandle: this.localStorageDataService.getUserCardFromEmailValue().userHandle
      };
      if (this.tmpName == 'checkEmailTmp2') {
        obj.email = this.accountemail;
      }
      this.authService.SetPassword(obj).subscribe(
        (res) => {
          this.tmpName = 'checkEmail';
        },
        (error) => {
          this.notificationService.showError(error.error, 'Error !');
        }
      );
    }
  }

  redirectToCardEmailLoginPage() {
    this.router.navigate(['/']);
  }

  sendResetLinkAction(token: string) {
    var emailValue = this.accountemail
      ? this.accountemail
      : this.localStorageDataService.getUserCardOrEmailValue().cardOrEmailValue;
    this.authService.forgotPassword(emailValue, token).subscribe(
      (res: any) => {
        if (res) {
          this.localStorageDataService.setSendEmailCardValue(emailValue);
          this.tmpName = 'checkEmail';
        }
      },
      (error) => {
        this.notificationService.showError(error.error, 'Error !');
      }
    );
  }

  ngOnDestroy() {
    this._forgotPassSubscriptions.unsubscribe();
    this.notificationService.clearAllToaster();
  }
}
