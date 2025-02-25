import { AfterContentInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { GRID_SERVICE_TOKEN } from '@matbia/matbia-data-grid/tokens';
import { MatbiaDataGridService } from '@matbia/matbia-data-grid/matbia-data-grid.service';
import { CommonAPIMethodService } from '@services/API/common-api-method.service';
import { IntegrateMerchantObj, IntegrationAPIService } from '@services/API/integration-api.service';

import { MerchantObj } from 'src/app/models/common-api-model';
import { PanelPopupsService } from '../../popups/panel-popups.service';

import { UseMIDPopupComponent } from '../popups/use-midpopup/use-midpopup.component';
import { UseApiKeyPopupComponent } from '../popups/use-api-key-popup/use-api-key-popup.component';
import { IntegratingAccountPopupComponent } from '../popups/integrating-account-popup/integrating-account-popup.component';

import { SharedModule } from '@matbia/shared/shared.module';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MatbiaSkeletonLoaderComponentComponent } from '@matbia/matbia-skeleton-loader/matbia-skeleton-loader-component/matbia-skeleton-loader-component.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule, CarouselModule, MatbiaSkeletonLoaderComponentComponent],
  providers: [
    {
      provide: GRID_SERVICE_TOKEN,
      useClass: MatbiaDataGridService,
    },
  ],
})
export class ListViewComponent implements OnInit, OnDestroy, AfterContentInit {
  merchantsFormatted: any = [];

  merchantsList: Array<MerchantObj> = [];

  integratedMerchants: Array<IntegrateMerchantObj> = [];

  rows$!: Observable<Array<MerchantObj>>;

  filterForm!: FormGroup;

  integratedLoading = false;

  itemsPerSlide = 5;
  noWrap = false;
  slideInterval = 2500;
  singleSlideOffset = true;

  get Search() {
    return this.filterForm.get('search');
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    protected title: Title,
    private fb: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageDataService,
    private popupService: PanelPopupsService,
    private commonAPI: CommonAPIMethodService,
    private integrationAPI: IntegrationAPIService,

    @Inject(GRID_SERVICE_TOKEN)
    public gridService: MatbiaDataGridService<MerchantObj>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Integration');
    this.rows$ = this.gridService.rows$ as Observable<MerchantObj[]>;

    this.filterForm = this.fb.group({
      search: this.fb.control(null),
    });

    this.Search?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((val) => {
      this.gridService.searchTerm = val;
    });

    this.getData();
    this.getIntegratedMerchantsList();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.gridService.ListData = [];
  }

  private getData() {
    const userHandle = this.localStorageService.getLoginUserUserName();
    this.gridService.Pagination = false;
    this.commonAPI.getMerchants(userHandle).subscribe((res) => {
      this.merchantsList = res;
      this.gridService.ListData = res;
      this.changeDetectorRef.detectChanges();
    });
  }

  private getIntegratedMerchantsList() {
    this.integratedLoading = true;
    const userHandle = this.localStorageService.getLoginUserUserName();
    this.integrationAPI.getIntegratedMerchants(userHandle).subscribe(
      (res) => {
        this.integratedLoading = false;
        this.integratedMerchants = res || [];
      },
      () => {
        this.integratedLoading = false;
      }
    );
  }

  onSelectMerchant(merchantObj: MerchantObj) {
    if (merchantObj.isDonary) {
      this.apiKey();
      return;
    }

    if (merchantObj.isCardknox) {
      this.useMid();
      return;
    }

    this.clickIntegratingAccount(merchantObj, null);
  }

  apiKey() {
    this.popupService.open(UseApiKeyPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-integration modal-api',
      size: 'md',
      scrollable: true,
    });
  }

  useMid() {
    this.popupService.open(UseMIDPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-integration modal-mid',
      size: 'md',
      scrollable: true,
    });
  }

  clickIntegratingAccount(merchantObj: MerchantObj | null = null, accountNum: number | string | null = null) {
    const modalRef = this.popupService.open(IntegratingAccountPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-integration',
      size: 'lg',
      scrollable: true,
    });

    modalRef.componentInstance.accountNum = accountNum;
    modalRef.componentInstance.merchantObj = merchantObj;

    modalRef.componentInstance.reOpen.subscribe((obj: any) => {
      this.clickIntegratingAccount(obj.merchantObj, obj.accountNum);
    });
  }
}
