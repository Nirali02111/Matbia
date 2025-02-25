import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ScheduleObj } from 'src/app/models/panels';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { NotificationService } from '@commons/notification.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  imports: [SharedModule],
})
export class ListItemComponent implements OnInit {
  @Input() item!: ScheduleObj;

  @Output() refresh = new EventEmitter();
  @Output() editSchedule = new EventEmitter();
  @Output() doCancelSchedule = new EventEmitter();

  constructor(private popupService: PanelPopupsService, private notification: NotificationService) {}

  ngOnInit(): void {}

  onEdit(event: any) {
    event.stopPropagation();
    this.editSchedule.emit(this.item);
  }

  openScheduleDetails(event: any) {
    if (event) {
      event.stopPropagation();
    }
    const modalRef = this.popupService.openScheduleDetail();
    modalRef.componentInstance.scheduleId = this.item.firstScheduleId;

    modalRef.componentInstance.refresh.subscribe(() => {
      this.refresh.emit(true);
    });
  }

  onCancelSchedule(event: any) {
    event.stopPropagation();
    const modalRef = this.notification.initConfirmPopup();
    modalRef.then((res) => {
      if (res.isConfirmed) {
        this.doCancelSchedule.emit(this.item);
      }
    });
  }
}
