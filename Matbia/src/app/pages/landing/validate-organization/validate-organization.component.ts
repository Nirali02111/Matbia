import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { shakeTrigger } from '@commons/animations';
import { NotificationService } from '@commons/notification.service';
import { CustomValidator } from '@commons/custom-validator';
import { AuthService } from '@services/API/auth.service';
import { OrganizationAPIService, OrgValidateResponse } from '@services/API/organization-api.service';
import { VerificationPopupComponent } from '../popup/verification-popup/verification-popup.component';

const MisMatch = (otherInputControl: AbstractControl | null): ValidatorFn => {
  return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
    if (
      inputControl.value !== undefined &&
      inputControl.value.trim() !== '' &&
      inputControl.value !== otherInputControl?.value
    ) {
      return { mismatch: true };
    }

    return null;
  };
};
import { SharedModule } from '@matbia/shared/shared.module';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';

@Component({
  selector: 'app-validate-organization',
  templateUrl: './validate-organization.component.html',
  styleUrls: ['./validate-organization.component.scss'],
  imports: [SharedModule, InputErrorComponent],
  animations: [shakeTrigger],
})
export class ValidateOrganizationComponent implements OnInit {
  isValidate = false;
  inAnimation = false;
  isLoading = false;

  isSubmitted = false;

  passwordFieldFocusOut = false;
  confirmPasswordFieldFocusOut = false;

  businessName = '';

  taxIdMask = '00-00000009';

  passwordType = 'password';
  confirmPasswordType = 'password';

  organizationValidateForm!: UntypedFormGroup;

  organizationResetPasswordForm!: UntypedFormGroup;

  get TaxId() {
    return this.organizationValidateForm.get('taxId');
  }

  get Email() {
    return this.organizationValidateForm.get('email');
  }

  get NewPassword() {
    return this.organizationResetPasswordForm.get('newPassword');
  }

  get ConfirmNewPassword() {
    return this.organizationResetPasswordForm.get('confirmNewPassword');
  }

  constructor(
    private router: Router,
    protected title: Title,
    private modalService: NgbModal,
    private fb: UntypedFormBuilder,
    private activeRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private organizationAPI: OrganizationAPIService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Validate Organization');

    this.initOrganizationValidateForm();
    this.initOrganizationPasswprdValidateForm();

    this.ConfirmNewPassword?.setValidators(
      Validators.compose([Validators.required, CustomValidator.strongPassword(), MisMatch(this.NewPassword)])
    );
    this.ConfirmNewPassword?.updateValueAndValidity();

    this.activeRoute.paramMap.subscribe((params) => {
      const id = params.get('orgId');
      if (id) {
        this.getOrgDetails(id);

        this.organizationValidateForm.patchValue({
          entityId: id,
        });

        this.organizationResetPasswordForm.patchValue({
          entityId: id,
        });

        this.organizationValidateForm.updateValueAndValidity();
        this.organizationResetPasswordForm.updateValueAndValidity();
      }
    });
  }

  getOrgDetails(idValue: string) {
    this.organizationAPI.getNameEncryptedId(idValue).subscribe((res) => {
      if (res) {
        this.businessName = res.name;
      }
    });
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

  initOrganizationValidateForm() {
    this.organizationValidateForm = this.fb.group({
      entityId: [null, Validators.compose([Validators.required])],
      taxId: [null, Validators.compose([Validators.required])],
      email: [null, Validators.compose([Validators.required, CustomValidator.email()])],
    });
  }

  initOrganizationPasswprdValidateForm() {
    this.organizationResetPasswordForm = this.fb.group({
      entityId: ['', Validators.compose([Validators.required])],
      newPassword: ['', Validators.compose([Validators.required, CustomValidator.strongPassword()])],
      confirmNewPassword: ['', Validators.compose([Validators.required])],
    });
  }

  onValidateOrganization() {
    if (this.organizationValidateForm.invalid) {
      this.organizationValidateForm.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    this.isLoading = true;
    this.organizationAPI
      .validateOrganization({
        ...this.organizationValidateForm.value,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res) {
            this.onInFlow(res);
          }
        },
        (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error, 'Error!');
        }
      );
  }

  onSetPassword() {
    this.isSubmitted = true;
    if (this.organizationResetPasswordForm.invalid) {
      this.organizationResetPasswordForm.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    this.isLoading = true;
    this.authService
      .resetPassword({
        ...this.organizationResetPasswordForm.value,
        currentPassword: null,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res) {
            this.router.navigate(['/auth/login']);
          }
        },
        (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error, 'Error!');
        }
      );
  }

  passwordFocused() {
    this.NewPassword?.markAsTouched();
  }

  confirmPasswordFocused() {
    this.ConfirmNewPassword?.markAsTouched();
  }

  ShowPassword(val: boolean) {
    if (val) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
  }

  ShowConfirmPassword(val: boolean) {
    if (val) {
      this.confirmPasswordType = 'password';
    } else {
      this.confirmPasswordType = 'text';
    }
  }

  onInFlow(res: OrgValidateResponse) {
    if (res) {
      if (res.isValid) {
        this.isValidate = true;
        this.notificationService.showSuccess(res.message);
        return;
      }

      if (res.message === 'SendEMail') {
        const modalOptions: NgbModalOptions = {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'active-card-pop',
        };
        const modalInc = this.modalService.open(VerificationPopupComponent, modalOptions);

        modalInc.componentInstance.email = this.Email?.value;

        modalInc.closed.subscribe(() => {
          this.router.navigate(['/']);
        });

        return;
      }

      this.notificationService.showError(res.message);
      return;
    }
  }
}
