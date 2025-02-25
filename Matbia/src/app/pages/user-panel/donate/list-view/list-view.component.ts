import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { PageRouteVariable } from '@commons/page-route-variable';
import { SearchInputComponent } from '@matbia/matbia-input/search-input/search-input.component';
import { FavoriteOrgObj, OrganizationAPIService, OrgObj } from '@services/API/organization-api.service';
import { PanelPopupsService } from '../../popups/panel-popups.service';
import { DonateObserverService } from '../donate-observer.service';

import { SharedModule } from '@matbia/shared/shared.module';
import { IsHebrewDirective } from '@matbia/matbia-directive/is-hebrew.directive';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule, SearchInputComponent, IsHebrewDirective, MatbiaSkeletonLoaderComponentComponent],
})
export class ListViewComponent implements OnInit, OnDestroy {
  isLoading = false;

  isFavoriteLoading = false;

  advancedSearchToggleDropdown = false;

  listData: Array<OrgObj> = [];

  favoriteListData: Array<FavoriteOrgObj> = [];

  searchBy: FormControl<string | null> = new FormControl('Name');

  currentRate = 0;
  public searchSub = '';

  @ViewChild(SearchInputComponent, { static: true }) searchInputComponent!: SearchInputComponent;
  showTooltip: boolean = false;
  isSearching: boolean = false;

  constructor(
    protected title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pageRoute: PageRouteVariable,
    private localStorage: LocalStorageDataService,
    private orgService: OrganizationAPIService,
    private popupService: PanelPopupsService,
    public donateObserver: DonateObserverService<OrgObj, FavoriteOrgObj>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.searchBy.valueChanges.subscribe(() => {
      this.showTooltip = false;
    });

    this.title.setTitle('Matbia - Donate');

    this.activatedRoute.data.subscribe(({ donateSearchData }) => {
      if (donateSearchData.list && donateSearchData.list.length !== 0) {
        this.listData = donateSearchData.list;
        this.searchSub = donateSearchData.lastSearch;
        this.favoriteListData = donateSearchData.favoriteList;
        this.donateObserver.ReturningBack = false;
        this.searchInputComponent.value = donateSearchData.lastSearch;
        return;
      }

      this.getOrganizationList();
      this.getFavoriteOrganizationList();
    });
  }

  ngOnDestroy(): void {
    if (!this.searchSub) {
      this.donateObserver.ListData = [];
    }
  }

  private isOrganizationIsBlocked(item: OrgObj | FavoriteOrgObj) {
    return item.businessType === 'Blocked';
  }

  private getOrganizationList(searchSubLength = 0) {
    this.isLoading = true;
    const username = this.localStorage.getLoginUserUserName();
    this.orgService.getOrganizationListByFields(username, this.searchSub, this.searchBy.value ?? 'Name').subscribe(
      (res) => {
        this.getOrganizationListRes(res);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private getOrganizationListRes(res: OrgObj[]) {
    this.isLoading = false;
    if (!res) {
      this.listData = [];
      return;
    }

    this.listData = res;
    this.donateObserver.ListData = res || [];
  }

  private getFavoriteOrganizationList() {
    this.isFavoriteLoading = true;
    const username = this.localStorage.getLoginUserUserName();
    this.orgService.getFavoriteOrganizationList(username).subscribe(
      (res) => {
        this.isFavoriteLoading = false;
        if (!res) {
          this.favoriteListData = [];
          return;
        }

        this.favoriteListData = res;
        this.donateObserver.FavoriteListData = res;
      },
      () => {
        this.isFavoriteLoading = false;
      }
    );
  }

  toggleFavorite(event: any, item: OrgObj) {
    event.stopPropagation();
    const username = this.localStorage.getLoginUserUserName();
    const userId = this.localStorage.getLoginUserId();
    const apiPayload = {
      userHandle: username,
      orgID: item.orgId,
      isFavourite: !item.isFavourite,
      createdBy: userId || 0,
    };
    this.orgService.saveFavoriteOrganization(apiPayload).subscribe(() => {
      this.getFavoriteOrganizationList();
      this.listData = this.listData.map((o) => {
        if (o.orgId === item.orgId) {
          return {
            ...o,
            isFavourite: !item.isFavourite,
          };
        }
        return {
          ...o,
        };
      });
    });
  }

  removeFavorite(event: any, item: FavoriteOrgObj) {
    event.stopPropagation();
    const username = this.localStorage.getLoginUserUserName();
    const userId = this.localStorage.getLoginUserId();
    const apiPayload = {
      userHandle: username,
      orgID: item.orgID,
      isFavourite: false,
      createdBy: userId || 0,
    };
    this.orgService.saveFavoriteOrganization(apiPayload).subscribe(() => {
      this.getFavoriteOrganizationList();
      this.listData = this.listData.map((o) => {
        if (o.orgId === item.orgID) {
          return {
            ...o,
            isFavourite: false,
          };
        }
        return {
          ...o,
        };
      });
    });
  }

  getInternalTransferRouterLink() {
    return this.pageRoute.getInternalTransferRouterLink();
  }

  sendMoneyToOrganization(encryptedOrgId: string, item: OrgObj | FavoriteOrgObj) {
    if (this.isOrganizationIsBlocked(item)) {
      const message1 = `As per request of ${item.doingBusinessAs}`;
      const message2 = `we blocked to send donations via portal.`;
      const message3 = `To give your donation contact email ${item.email}`;
      Swal.fire({
        imageUrl: 'assets/dist/img/payment-failed.png',
        html: `<p><span>${message1}</span><span>${message2}</span><span>${message3}</span></p>`,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: 'OK',
        customClass: {
          container: 'matbia-swal-donation-block-container',
          popup: 'matbia-swal-donation-block-popup',
          confirmButton: 'confirm-btn',
        },
      });
      return;
    }

    this.donateObserver.LastSearchTerm = this.searchSub;
    this.router.navigate([`/dashboard/donate`, encryptedOrgId, 'donate']);
  }

  applyFilter(data: string) {
    this.isSearching = data.length >= 1;
    this.searchSub = data;
    this.onBtnClick();
  }

  onBtnClick() {
    if (this.searchSub.length >= 2 || this.searchSub.length === 0) {
      this.getOrganizationList(this.searchSub.length);
    }
  }

  onClearClick() {
    this.searchInputComponent.value = '';
    this.searchInputComponent.triggerSearch();
  }

  private getReportMissingAndThankYouPopup() {
    return this.popupService.openReportMissingOrganization();
  }

  onMissingOrganization() {
    const modalRef = this.getReportMissingAndThankYouPopup();

    modalRef.componentInstance.openThankYouModal.subscribe((organizationName: string) => {
      this.openThankYouMissingPopup(organizationName);
    });
  }

  private openThankYouMissingPopup(organizationName: string) {
    const modalRef = this.getReportMissingAndThankYouPopup();
    modalRef.update({ fullscreen: false });
    modalRef.componentInstance.isThankYou = true;
    modalRef.componentInstance.reportedOrganizationName = organizationName;

    modalRef.componentInstance.refresh.subscribe(() => {
      this.getOrganizationList();
    });
  }

  advancedToggle() {
    this.advancedSearchToggleDropdown = !this.advancedSearchToggleDropdown;
  }

  toggleTooltip(showTooltip: boolean) {
    this.showTooltip = showTooltip;
  }

  getLocation(item: OrgObj['mailing']) {
    if (item) {
      return Object.values(item)
        .filter((value) => value)
        .join(', ');
    } else {
      return '';
    }
  }

  getlegalAddress(item: OrgObj['legalAddress']) {
    if (item) {
      return Object.values(item)
        .filter((value) => value)
        .join(', ');
    } else {
      return '';
    }
  }
}
