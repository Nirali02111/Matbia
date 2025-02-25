import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NotificationService } from '@commons/notification.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DonorTransactionAPIService } from '@services/API/donor-transaction-api.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-edit-note-popup',
  templateUrl: './edit-note-popup.component.html',
  styleUrls: ['./edit-note-popup.component.scss'],
  imports: [SharedModule],
})
export class EditNotePopupComponent implements OnInit, AfterContentInit {
  formGroup!: FormGroup;

  @Input() note!: string | null;
  @Input() transactionId!: string | number;

  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  get Note() {
    return this.formGroup.get('note');
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private localStorage: LocalStorageDataService,
    private notification: NotificationService,
    private donorTransactionAPI: DonorTransactionAPIService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      note: this.fb.control(this.note, Validators.compose([])),
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.closePopup();

    const loader = this.notification.initLoadingPopup();

    loader.then((res) => {
      if (res.isConfirmed) {
        this.refresh.emit(true);
      }
    });

    const username = this.localStorage.getLoginUserUserName();

    this.donorTransactionAPI
      .updateNote({
        userHandle: username,
        transactionId: this.transactionId,
        note: this.Note?.value ? this.Note.value : null,
      })
      .subscribe(
        (res) => {
          this.notification.hideLoader();
          this.notification.displaySuccess(res);
        },
        (err) => {
          this.notification.throwError(err.error);
        }
      );
  }
}
