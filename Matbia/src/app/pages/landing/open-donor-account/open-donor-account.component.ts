import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { forkJoin, timer } from 'rxjs';
import { switchMap, share, retry, takeWhile, last } from 'rxjs/operators';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { TermsOfServicePopupComponent } from '@matbia/matbia-terms-of-service/terms-of-service-popup/terms-of-service-popup.component';
import { KYC_VERIFICATION_STATUS, KYC_FAILED_TAGS } from '@enum/KYC';
import { CommonDataService } from '@commons/common-data-service.service';
import { CustomValidator } from '@commons/custom-validator';
import { NotificationService } from '@commons/notification.service';
import { UserApiService } from '@services/API/user-api.service';
import { CommonAPIMethodService } from '@services/API/common-api-method.service';
import {
  KYCCheckResponse,
  RegisterResponse,
  UploadDocumentResponse,
  VerificationHistoryObj,
} from './../../../models/login-model';
import { KYCDocumentType } from './../../../models/common-api-model';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-open-donor-account',
  templateUrl: './open-donor-account.component.html',
  styleUrls: ['./open-donor-account.component.scss'],
  imports: [SharedModule],
})
export class OpenDonorAccountComponent implements OnInit {
  pageTitle = 'Open a donor account';
  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Open a donor account',
  };

  hasError = '';
  hasUploadError = '';
  isloading = false;
  stopPolling: any = false;
  form: UntypedFormGroup;
  docForm: UntypedFormGroup;

  needDocumentUpload = false;

  registration = false;
  getFailedAndUpdate = false;

  listOfDocumentTypes: Array<KYCDocumentType> = [];

  finalMessage = '';
  successfullyRegister = false;

  requiredDocumentTemplate = '';
  multipleCounter = 0;

  modalOptions: NgbModalOptions = {
    centered: true,
    backdrop: 'static',
    keyboard: false,
    windowClass: 'drag_popup',
    size: 'xl',
    scrollable: true,
  };

  constructor(
    private metaTags: Meta,
    protected title: Title,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    public commonDataService: CommonDataService,
    private userAPIService: UserApiService,
    private commonAPIDataService: CommonAPIMethodService,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({});
    this.docForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);

    this.initRegisterFormGroup();
  }

  initRegisterFormGroup() {
    this.form = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(40)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(40)])],
      address: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(40)])],
      city: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(40)])],
      state: ['', Validators.required],
      zip: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(10)])],
      birthDate: ['', Validators.compose([Validators.required, CustomValidator.age18])],
      email: ['', Validators.compose([Validators.required, CustomValidator.email(), Validators.maxLength(254)])],
      phone: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])],

      userName: ['', Validators.compose([Validators.required, Validators.pattern(/^[-a-zA-Z0-9_\\.]+$/)])],
      isAggree: [false, Validators.requiredTrue],
    });
  }

  initDocFormGroup() {
    this.docForm = this.fb.group({
      document: ['', Validators.compose([Validators.required, CustomValidator.validDocument])],
      documentSource: [[], Validators.required],

      documentType: ['', Validators.required],
      identityType: ['', Validators.required],

      userHandle: ['', Validators.required],
    });
  }

  getDocumentTypesOfKYCList() {
    this.commonAPIDataService.documentTypesOfKYC().subscribe((result) => {
      this.listOfDocumentTypes = result;
    });
  }

  openTerms(event: any) {
    event.preventDefault();
    this.modalService.open(TermsOfServicePopupComponent, this.modalOptions);
  }

  onUpdate() {
    this.isloading = true;
    this.userAPIService.update({ ...this.form.value, userHandle: this.form.value.userName }).subscribe(
      (res: UploadDocumentResponse) => {
        if (res.errors && res.errors.length > 0) {
          this.isloading = true;
          this.hasError = res.errors[0].error;
          return;
        }

        if (res.success && res.errors.length === 0) {
          this.checking();
        }
      },
      (error) => {
        this.isloading = false;
        if (error.error) {
          this.hasError = error.error;
        }
      }
    );
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.isloading = true;
    if (this.getFailedAndUpdate) {
      this.onUpdate();
      return;
    }

    this.userAPIService.register({ ...this.form.value }).subscribe(
      (res: RegisterResponse) => {
        if (res.failedKYCCount && res.failedKYCCount !== 0) {
          this.isloading = false;
          if (res.failedKYCCount === 1) {
            this.onUpdate();
            return;
          } else if (res.failedKYCCount >= 2) {
            this.checking();
            return;
          }
        } else {
          if (res.errors && res.errors.length > 0) {
            this.isloading = false;
            this.hasError = res.errors[0].error;
            return;
          }

          if (res.data.success) {
            this.checking();
          }
        }
      },
      (error) => {
        this.isloading = false;
        if (error.error) {
          this.hasError = error.error;
        }
      }
    );
  }

  checking() {
    timer(1, 3000)
      .pipe(
        switchMap(() => this.userAPIService.checkKYC(this.form.value.userName)),
        retry(),
        share(),
        takeWhile((result: KYCCheckResponse) => {
          const reCheck: Array<string> = [
            KYC_VERIFICATION_STATUS.PENDING,
            KYC_VERIFICATION_STATUS.REVIEW,
            KYC_VERIFICATION_STATUS.MEMBER_REVIEW,
            KYC_VERIFICATION_STATUS.MEMBER_PENDING,
            KYC_VERIFICATION_STATUS.WEBHOOK_PENDING,
          ];

          const [latestProcess] = result.data.verificationHistory;

          return reCheck.includes(latestProcess.verificationStatus);
        }, true),
        last()
      )
      .subscribe((result: KYCCheckResponse) => {
        this.isloading = false;

        const [latestProcess] = result.data.verificationHistory;

        if (result.data.verificationStatus === KYC_VERIFICATION_STATUS.FAILED) {
          // Check Failed for more then 2 times then ask for upload document
          if (
            result.data.verificationHistory.filter((o) => o.verificationStatus === KYC_VERIFICATION_STATUS.FAILED)
              .length >= 2
          ) {
            this.setDocumentForm(latestProcess);
            return;
          } else {
            this.registration = false;
            this.getFailedAndUpdate = true;
            this.hasError =
              'The information you supplied is not sufficient to establish your identity, please review your input above and correct any mistakes.';
            return;
          }
        }

        if (result.data.verificationStatus === KYC_VERIFICATION_STATUS.DOCUMENTS_REQUIRED) {
          this.setDocumentForm(latestProcess);
          return;
        }

        if (result.data.verificationStatus === KYC_VERIFICATION_STATUS.PASSED) {
          this.registration = true;
          this.successfullyRegister = true;
          this.finalMessage = `${result.data.message}. Please Check your mail`;
          this.notificationService.showSuccess(this.finalMessage, 'Success');
        }
      });
  }

  setDocumentForm(latestProcess: VerificationHistoryObj) {
    this.getDocumentTypesOfKYCList();
    this.initDocFormGroup();
    this.registration = true;
    this.needDocumentUpload = true;

    this.checkFailedLevel(latestProcess);

    this.docForm.patchValue({
      userHandle: this.form.controls.userName.value,
    });
  }

  onSelectDocumentType() {
    const selectedDoc = this.listOfDocumentTypes.find((o) => o.name === this.docForm.controls.documentType.value);
    this.docForm.patchValue({
      identityType: selectedDoc?.identityType,
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const listofFiles = [];
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < event.target.files.length; index++) {
        const file = event.target.files[index];
        listofFiles.push(file);
      }

      this.docForm.controls.documentSource.patchValue(listofFiles);

      this.docForm.updateValueAndValidity();
    }
  }

  onUpload() {
    const fd = new FormData();

    fd.append('UserHandle', this.docForm.value.userHandle);
    fd.append('DocumentType', this.docForm.value.documentType);
    fd.append('IdentityType', this.docForm.value.identityType);
    fd.append('Description', `${this.docForm.value.userHandle} uploading document`);

    if (this.docForm.controls.documentSource.value && this.docForm.controls.documentSource.value.length > 1) {
      fd.append('Name', this.docForm.value.documentSource[0].name);
      fd.append('File', this.docForm.value.documentSource[0]);

      const fd2 = new FormData();

      fd2.append('UserHandle', this.docForm.value.userHandle);
      fd2.append('DocumentType', this.docForm.value.documentType);
      fd2.append('IdentityType', this.docForm.value.identityType);
      fd2.append('Description', `${this.docForm.value.userHandle} uploading document`);
      fd2.append('Name', this.docForm.value.documentSource[1].name);
      fd2.append('File', this.docForm.value.documentSource[1]);

      const uploadMultiple = [this.userAPIService.uploadDocument(fd), this.userAPIService.uploadDocument(fd)];

      this.isloading = true;
      forkJoin(uploadMultiple).subscribe(
        (responses) => {
          this.isloading = false;

          if (responses && (responses[0].errors.length > 0 || responses[1].errors.length > 0)) {
            this.hasUploadError = responses[0].errors[0].field || responses[1].errors[0].field;
            return;
          }

          if (responses[0].success && responses[1].success) {
            this.checkNextStep();
          }
        },
        (error) => {
          this.isloading = false;
          this.hasUploadError = error.error;
        }
      );
    } else {
      fd.append('Name', this.docForm.value.documentSource[0].name);
      fd.append('File', this.docForm.value.documentSource[0]);

      this.isloading = true;
      this.userAPIService.uploadDocument(fd).subscribe(
        (response) => {
          this.isloading = false;
          if (response.errors.length > 0) {
            this.hasUploadError = response.errors[0].field;
            return;
          }

          this.checkNextStep();
        },
        (error) => {
          this.isloading = false;
          this.hasUploadError = error?.error;
        }
      );
    }
  }

  checkNextStep() {
    this.multipleCounter += 1;
    const docMessage = `Your application will take several days to process, we will get back to you via email.`;

    if (this.requiredDocumentTemplate === 'ssn' && this.multipleCounter !== 2) {
      this.docForm.reset();

      this.docForm.patchValue({
        userHandle: this.form.controls.userName.value,
      });

      this.notificationService.showSuccess('Please Upload another document', 'Success');
      return;
    }

    this.needDocumentUpload = false;
    this.successfullyRegister = true;
    this.finalMessage = docMessage;
    this.notificationService.showSuccess(docMessage, 'Success');
  }

  checkFailedLevel(latestProcess: VerificationHistoryObj) {
    if (latestProcess.tags.length >= 2) {
      const [firstTag, secondTag] = latestProcess.tags;

      if (firstTag === KYC_FAILED_TAGS.NAME_MISMATCH && secondTag === KYC_FAILED_TAGS.NAME_NOT_VERIFIED) {
        this.requiredDocumentTemplate = 'name';
        return;
      } else if (firstTag === KYC_FAILED_TAGS.DOB_MISKEY && secondTag === KYC_FAILED_TAGS.DOB_NOT_VERIFIED) {
        this.requiredDocumentTemplate = 'dob';
        return;
      } else if (
        firstTag === KYC_FAILED_TAGS.ADDRESS_NOT_MATCHED &&
        secondTag === KYC_FAILED_TAGS.ADDRESS_NOT_VERIFIED
      ) {
        this.requiredDocumentTemplate = 'address';
        return;
      } else if (firstTag === KYC_FAILED_TAGS.SSN_MISKEY && secondTag === KYC_FAILED_TAGS.SSN_NOT_VERIFIED) {
        this.requiredDocumentTemplate = 'ssn';
        return;
      } else {
        this.requiredDocumentTemplate = 'general';
        return;
      }
    }
  }
}
