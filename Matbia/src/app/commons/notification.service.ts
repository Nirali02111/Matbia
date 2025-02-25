import { EventEmitter, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}
  msgCount = 0;
  toastClicked = new EventEmitter<boolean>();
  showSuccess(message: any, title: any = 'Success') {
    this.toastr.success(message, title);
  }

  showError(message: any, title: any = 'Error !') {
    this.toastr
      .error(message, title, {
        disableTimeOut: true,
        tapToDismiss: true,
      })
      .onTap.pipe(take(1))
      .subscribe(() => this.toastClicked.emit(true));

    this.toastr.toastrConfig.preventDuplicates = true;
  }

  showInfo(message: any, title: any) {
    this.toastr.info(message, title);
    this.toastr.toastrConfig.preventDuplicates = true;
  }

  showWarning(message: any, title: any) {
    this.toastr.warning(message, title);
    this.toastr.toastrConfig.preventDuplicates = true;
  }

  clearAllToaster() {
    this.toastr.clear();
  }

  initLoadingPopup(options?: SweetAlertOptions): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'CONTINUE',
      customClass: {
        loader: 'matbia-swal-loader',
        container: 'matbia-swal-container',
        popup: 'matbia-swal-popup',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      didOpen: () => {
        Swal.showLoading();
      },
      ...options,
    });
  }

  hideLoader() {
    Swal.hideLoading();
  }

  close() {
    Swal.close();
  }

  displaySuccess(message: any) {
    Swal.update({
      text: message,
      icon: 'success',
      showCancelButton: false,
    });
  }

  displayError(error: any) {
    Swal.update({
      text: error,
      icon: 'error',
      showConfirmButton: false,
    });
  }

  throwError(error: any) {
    this.hideLoader();
    this.displayError(error);
  }

  initConfirmPopup(title = 'Are you sure?', text = 'You will not be able to undo the action!') {
    return Swal.fire({
      title,
      text,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showCloseButton: true,
      reverseButtons: true,
      focusCancel: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',

      customClass: {
        container: 'matbia-swal-confirm-container',
        popup: 'matbia-swal-confirm-popup',
        cancelButton: 'confirm-cancel-btn',
        confirmButton: 'confirm-btn',
      },
    });
  }

  initWarningPopup(title = 'Are you sure?', text = 'You will not be able to undo the action!') {
    const d = this.initConfirmPopup(title, text);
    Swal.update({
      icon: 'warning',
    });
    return d;
  }
}
