import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ListViewComponent } from './list-view/list-view.component';
import { DonateToOrganizationComponent } from './donate-to-organization/donate-to-organization.component';
import { DonateObserverService } from './donate-observer.service';
import { FavoriteOrgObj, OrgObj } from '@services/API/organization-api.service';

@Injectable()
export class DonateSearchResolver  {
  constructor(public donateObserver: DonateObserverService<OrgObj, FavoriteOrgObj>) {}

  resolve(): Observable<any> | Promise<any> | any {
    if (this.donateObserver.checkIsHaveData()) {
      return this.donateObserver.rows$;
    }
    return of({ list: [] });
  }
}

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
        resolve: {
          donateSearchData: DonateSearchResolver,
        },
      },
      {
        path: ':id/donate',
        component: DonateToOrganizationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DonateRoutingModule {}
