import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Assets } from '@enum/Assets';
import { TransactionTypes } from '@enum/Transaction';
import { ScheduleObj } from 'src/app/models/panels';
import { PanelPopupsService } from 'src/app/pages/user-panel/popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-schedule-row-item',
  templateUrl: './schedule-row-item.component.html',
  styleUrls: ['./schedule-row-item.component.scss'],
  imports: [SharedModule],
})
export class ScheduleRowItemComponent implements OnInit {
  profileIcon = Assets.PROFILE_IMAGE;

  @Input() item!: ScheduleObj;
  @Output() refresh = new EventEmitter();

  get Assets() {
    return Assets;
  }

  get isDonation(): boolean {
    return this.item.transType === TransactionTypes.DONATION;
  }

  get isDeposit(): boolean {
    return this.item.transType === TransactionTypes.DEPOSIT;
  }

  getToCopy() {
    return `${this.item.remaining} / ${this.item.repeatTimes}`;
  }

  constructor(private popupService: PanelPopupsService) {}

  ngOnInit(): void {}

  openScheduleDetails() {
    const modalRef = this.popupService.openScheduleDetail();
    modalRef.componentInstance.scheduleId = this.item.firstScheduleId;

    modalRef.componentInstance.refresh.subscribe((val: boolean) => {
      this.refresh.emit(val);
    });
  }
}
