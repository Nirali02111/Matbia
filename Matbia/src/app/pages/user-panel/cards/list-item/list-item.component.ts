import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@commons/notification.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MatbiaCardObj } from '@services/API/matbia-card-setting.service';
import { MatbiaCardAPIService } from '@services/API/matbia-card-api.service';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  imports: [SharedModule],
})
export class ListItemComponent implements OnInit {
  isLoading = false;
  @Input() item!: MatbiaCardObj;

  @Output() reload = new EventEmitter();

  constructor(
    private router: Router,
    private pageRoute: PageRouteVariable,
    private matbiaCardAPI: MatbiaCardAPIService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {}

  viewCardDetails() {
    this.router.navigate([...this.pageRoute.getCardsRouterLink(), this.item.cardId, 'card-details'], {
      onSameUrlNavigation: 'reload',
    });
  }

  isEndWithNine(expiry: string | null) {
    if (expiry) {
      const character = expiry.trim().charAt(expiry.length - 1);
      return character === '9';
    }

    return false;
  }

  deleteAction() {
    this.isLoading = true;
    this.matbiaCardAPI
      .updateCardStatus({
        cardId: this.item.cardId,
        statusId: -1,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.notification.showSuccess(res);
          this.reload.emit(true);
        },
        (err) => {
          this.isLoading = false;
          this.notification.showError(err.error, 'Error!');
        }
      );
  }

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }
}
