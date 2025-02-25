import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { Formats } from '@enum/Formats';
import { TransactionTypes } from '@enum/Transaction';
import { BatchDetailObj } from '@services/API/batch-api.service';
import moment from 'moment';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-batch-row-item',
  templateUrl: './batch-row-item.component.html',
  styleUrls: ['./batch-row-item.component.scss'],
  imports: [SharedModule],
})
export class BatchRowItemComponent implements OnInit {
  @Input() item!: BatchDetailObj;

  get isRefund(): boolean {
    return this.item.type === TransactionTypes.REFUND;
  }

  constructor(private router: Router, private pageRoute: PageRouteVariable) {}

  ngOnInit(): void {}

  private setMenu() {
    const hasValue = localStorage.getItem('sidebarMenu');

    if (!hasValue) {
      return;
    }

    const showMenus = JSON.parse(hasValue);
    Object.keys(showMenus).forEach((key) => {
      showMenus[key] = false;
    });

    showMenus['activityMenu'] = true;

    localStorage.setItem('sidebarMenu', JSON.stringify(showMenus));
  }

  viewTransaction() {
    this.setMenu();

    this.router.navigate(this.pageRoute.getTransactionsRouterLink(), {
      queryParams: {
        batchNum: this.item.batchNum,
        firstTransDate: moment(this.item.firstTransDate).format(Formats.DATE_SHORT_FORMAT),
        lastTransDate: moment(this.item.lastTransDate).format(Formats.DATE_SHORT_FORMAT),
      },
    });
  }
}
