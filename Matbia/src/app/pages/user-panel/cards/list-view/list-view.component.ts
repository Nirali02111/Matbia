import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { MatbiaCardObj, MatbiaCardSettingService } from '@services/API/matbia-card-setting.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { ListItemComponent } from '../list-item/list-item.component';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule, ListItemComponent, MatbiaSkeletonLoaderComponentComponent],
})
export class ListViewComponent implements OnInit {
  isLoading = false;

  listCards: Array<MatbiaCardObj> = [];

  isAdditionalCard = false;

  constructor(
    protected title: Title,
    private router: Router,
    private pageRoute: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private matbiaCardSettingAPI: MatbiaCardSettingService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - List of cards');
    this.getCardsList();

    const userData = this.localStorage.getLoginUserData();

    if (userData && userData.isCardSettingsSaved) {
      this.isAdditionalCard = true;
    }
  }

  viewCardDetails() {
    this.router.navigate([...this.pageRoute.getCardsRouterLink(), 1, 'card-details']);
  }

  getAddAdditionalRouterLink() {
    return this.pageRoute.getAddAdditionalCardRouterLink();
  }

  redirectToValidateCard() {
    return this.router.navigate([...this.pageRoute.getAddAdditionalCardRouterLink()], {
      state: { isUserLoggedIn: true },
    });
  }

  getCardRequestRouterLink() {
    return this.pageRoute.getCardRequestRouterLink();
  }

  getCardsList() {
    this.isLoading = true;
    const userHandle = this.localStorage.getLoginUserUserName();
    this.matbiaCardSettingAPI.GetSetting(userHandle).subscribe(
      (res) => {
        this.isLoading = false;
        if (res) {
          this.listCards = res.filter((o) => {
            return o.statusID !== -1;
          });
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }
}
