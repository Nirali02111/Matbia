import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NotificationService } from '@commons/notification.service';
import { TransactionStatus } from '@enum/Transaction';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PastAndUpcomingScheduleObj, ScheduleAPIService, ScheduleCardObj } from '@services/API/schedule-api.service';

import { SharedModule } from '@matbia/shared/shared.module';
import moment from 'moment';

@Component({
  selector: 'app-schedule-details-popup',
  templateUrl: './schedule-details-popup.component.html',
  styleUrls: ['./schedule-details-popup.component.scss'],
  imports: [SharedModule],
})
export class ScheduleDetailsPopupComponent implements OnInit {
  isLoading = false;
  needRefresh = false;
  scheduleDetails!: ScheduleCardObj;
  pastScheduleList: Array<PastAndUpcomingScheduleObj> = [];
  upcomingScheduleList: Array<PastAndUpcomingScheduleObj> = [];

  scheduleFilterGroup!: UntypedFormGroup;

  scheduleFile = [
    {
      id: 1,
      label: 'Upcoming Payments',
    },
    {
      id: 2,
      label: 'Past Payments',
    },
  ];

  openCount = 0;
  paidCount = 0;

  @Input() scheduleId!: number;

  @Output() refresh = new EventEmitter();

  get isCompleted(): boolean {
    return this.scheduleDetails?.scheduleStatus === TransactionStatus.COMPLETED;
  }

  get isStopped(): boolean {
    return this.scheduleDetails?.scheduleStatus === TransactionStatus.STOPPED;
  }

  get isScheduled(): boolean {
    return this.scheduleDetails?.scheduleStatus === TransactionStatus.SCHEDULED;
  }

  get isScheduleInProgress(): boolean {
    return this.scheduleDetails?.scheduleStatus === TransactionStatus.SCHEDULE_IN_PROGRESS;
  }

  get canStopSchedule(): boolean {
    return this.scheduleDetails?.totalPaid > 0;
  }

  get ScheduleFileType() {
    return this.scheduleFilterGroup.get('scheduleFileType');
  }

  get declinedStatus() {
    return `${
      this.pastScheduleList.filter((schedules) => schedules?.transStatus?.toLowerCase() == 'declined').length
    } Declined`;
  }

  get createdOn() {
    return moment(this.scheduleDetails?.createdDate).format('MMM D, h:mma');
  }

  constructor(
    private fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private scheduleAPIService: ScheduleAPIService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.scheduleFilterGroup = this.fb.group({
      scheduleFileType: this.fb.control(1),
    });

    this.getDetails();
  }

  onCancelSchedule() {
    this.doCancelSchedule();
  }

  onStopSchedule() {
    this.doStopSchedule();
  }

  closePopup() {
    if (this.needRefresh) {
      this.refresh.emit(true);
    }
    this.activeModal.dismiss();
  }

  private getDetails() {
    this.isLoading = true;
    this.scheduleAPIService.getScheduleCard(this.scheduleId).subscribe(
      (res) => {
        this.isLoading = false;
        this.scheduleDetails = res.mainSchedule;
        this.pastScheduleList = res.pastSchedules || [];
        this.upcomingScheduleList = res.upcomingSchedules || [];

        this.openCount = this.upcomingScheduleList.length;
        this.paidCount = this.pastScheduleList.length;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private doCancelSchedule() {
    this.isLoading = true;
    this.scheduleAPIService
      .cancel({
        scheduleId: this.scheduleId,
        sendCancellationEmail: true,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.needRefresh = true;
          this.notification.showSuccess(res);
          this.getDetails();
        },
        (err) => {
          this.isLoading = false;
          this.notification.showError(err.error);
        }
      );
  }

  private doStopSchedule() {
    this.isLoading = true;
    this.scheduleAPIService
      .cancel({
        scheduleId: this.scheduleId,
        isStopStatus: true,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.needRefresh = true;
          this.notification.showSuccess(res);
          this.getDetails();
        },
        (err) => {
          this.isLoading = false;
          this.notification.showError(err.error);
        }
      );
  }
}
