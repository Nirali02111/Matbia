import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { CustomValidator } from '@commons/custom-validator';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { AuthService } from '@services/API/auth.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { OnlineAccountFormGroupComponent } from '@matbia/matbia-form-group/online-account-form-group/online-account-form-group.component';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  imports: [SharedModule, OnlineAccountFormGroupComponent],
})
export class CreateAccountComponent implements OnInit, AfterViewInit {
  isLoading = false;
  signUpWithoutCardForm!: UntypedFormGroup;

  @ViewChild('contentModal') contentModal: any;

  constructor(
    private fb: UntypedFormBuilder,
    private route: Router,
    private modalService: NgbModal,
    private notificationService: NotificationService,
    public authService: AuthService,
    private localStorageDataService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.signUpWithoutCardForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidator.email()])],
      card: ['', Validators.required],
      pin: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
    });
  }

  ngAfterViewInit(): void {
    const modalRef = this.modalService.open(this.contentModal, {
      centered: true,
      keyboard: false,
      windowClass: 'online-account',
    });

    modalRef.closed.subscribe(() => {
      this.route.navigate(['/']);
    });
  }

  onSignUpWithoutCardFormSubmit() {
    if (this.signUpWithoutCardForm.invalid) {
      this.signUpWithoutCardForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const value = this.signUpWithoutCardForm.value;

    this.authService
      .matbiaCardLogin({
        matbiaCardNum: value.card,
        pin: value.pin,
      })
      .pipe(
        map((data) => data),
        switchMap((data) => {
          this.localStorageDataService.setLoginUserDataAndToken(data);

          return this.authService.shulKioskSetPassword({
            email: value.email,
            userHandle: data.userName,
          });
        })
      )
      .subscribe(
        (val) => {
          this.isLoading = false;
          if (val) {
            this.route.navigate(['/']);
            this.modalService.dismissAll();
          }
        },
        (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error, 'Error !');
        }
      );
  }
}
