import { Component, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '@matbia/shared/shared.module';
import { OrganizationAPIService, OrgObj } from '@services/API/organization-api.service';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BusinessUpdatePayload } from 'src/app/models/login-model';
import { Assets } from '@enum/Assets';
import { CommonDataService } from '@commons/common-data-service.service';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-organization-popup',
  templateUrl: './update-organization-popup.component.html',
  styleUrl: './update-organization-popup.component.scss',
  imports: [SharedModule, PhoneInputComponent],
})
export class UpdateOrganizationPopupComponent implements OnInit {
  profileIcon = Assets.PROFILE_IMAGE;
  orgForm!: FormGroup;
  isLoading: WritableSignal<boolean> = signal(false);

  profilePreview: any = {
    orgLogo: '',
    displayName: '',
    mailingAddress: '',
    phone: '',
    businessName: '',
    legalAddress: '',
    orgJewishName: '',
  };
  imageUrl: string = '';

  private organizationAPI = inject(OrganizationAPIService);
  private fb = inject(FormBuilder);
  private localStorage = inject(LocalStorageDataService);
  private activeModal = inject(NgbActiveModal);
  commonDataService = inject(CommonDataService);
  orgHandle: string = '';

  get orgLogo() {
    return this.orgForm.get('orgLogo') as FormGroup;
  }

  get isOrganizationFormValid() {
    return this.orgForm.valid && this.orgLogo.valid;
  }

  constructor() {}

  ngOnInit(): void {
    this.fetchOrganizationData();
    this.initializeOrganizationForm();
  }

  initializeOrganizationForm() {
    this.orgForm = this.fb.group({
      displayName: ['', Validators.required],
      orgJewishName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      ownerName: ['', Validators.required],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhone: ['', Validators.required],
      orgLogo: this.fb.group({
        fileName: [null],
        fileBase64: [null],
      }),
    });
  }

  fetchOrganizationData(): void {
    this.orgHandle = this.localStorage.getLoginUserUserName();
    this.organizationAPI.getOrganizationByUsername(this.orgHandle).subscribe(
      (response: any) => {
        if (response) this.setOrganizationValue(response);
      },
      (err) => {
        console.log(err);
        this.activeModal.close();
      }
    );
  }

  setOrganizationValue(data: OrgObj) {
    this.orgForm.patchValue({
      orgJewishName: data.orgJewishName || '',
      phone: data.phone || '',
      address: data.mailing?.address || '',
      city: data.mailing?.city || '',
      state: data.mailing?.state || '',
      zip: data.mailing?.zip || '',
      ownerName: data.ownerName || '',
      ownerEmail: data.ownerEmail || '',
      ownerPhone: data.ownerPhone || '',
    });

    this.profilePreview = data;
    const { mailing } = this.profilePreview;
    this.profilePreview.mailingAddress = Object.values(mailing).filter(Boolean).join(', ');

    const { apt, address, city, state, zip } = data;
    this.profilePreview.legalAddress = [apt, address, city, state, zip].filter(Boolean).join(', ');
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const listOfFiles = [];
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < event.target.files.length; index++) {
        const file = event.target.files[index];
        listOfFiles.push(file);
      }

      const selectedFile = event.target.files[0];
      this.orgLogo.get('fileName')?.setValue(selectedFile.name);
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = this.handleReaderLoaded.bind(this);
    }
  }

  handleReaderLoaded(e: any) {
    this.imageUrl = e.target.result;
    const base64textString = (e.target.result || 'base64,').split('base64,')[1];
    this.orgLogo.get('fileBase64')?.setValue(base64textString);
  }

  onSubmit(): void {
    if (this.orgForm.valid) {
      this.isLoading.set(true);
      const organizationPayload: BusinessUpdatePayload = {
        ...this.orgForm.value,
        orgHandle: this.orgHandle,
      };
      this.organizationAPI.update(organizationPayload).subscribe({
        next: (res: any) => {
          this.activeModal.close();
          Swal.fire({
            title: 'Success!',
            text: 'Your organization’s information has been updated.',
            icon: 'success',
            confirmButtonText: 'Close',
            customClass: {
              popup: 'org-update-success',
            },
          });
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        },
      });
    }
  }
}
