import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@services/API/auth.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-time-out-popup',
  templateUrl: './time-out-popup.component.html',
  styleUrls: ['./time-out-popup.component.scss'],
  imports: [SharedModule],
})
export class TimeOutPopupComponent implements OnInit {
  timerInterval: any;
  start = 60;

  @Output() timeOutEvent = new EventEmitter();
  @Output() stayInEvent = new EventEmitter();

  constructor(
    private authService: AuthService,
    public activeModal: NgbActiveModal,
    private localStorageDataService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.startTimer();
  }

  closePopup() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.activeModal.dismiss();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.start === 0) {
        this.onTimeOut();
        return;
      }
      this.start -= 1;
    }, 1000);
  }

  onTimeOut() {
    this.closePopup();
    this.timeOutEvent.emit(true);
  }

  onStayLogin() {
    const accessToken = this.localStorageDataService.getLoginUserAccessToken();
    const refreshToken = this.localStorageDataService.getLoginUserRefreshToken();
    const loginUserID = this.localStorageDataService.getLoginUserId();

    const modelData: any = {
      accessToken,
      refreshToken,
      LoginUserID: loginUserID,
    };

    return this.authService.refreshToken(modelData).subscribe((data: any) => {
      this.localStorageDataService.setAccessToken(data.accessToken);
      this.localStorageDataService.setRefreshToken(data.refreshToken);
      this.localStorageDataService.setTokenExpiryTime(data.expiresIn);
      this.closePopup();
      this.stayInEvent.emit(true);
    });
  }
}
