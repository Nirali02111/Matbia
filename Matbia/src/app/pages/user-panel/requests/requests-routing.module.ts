import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListViewComponent } from './list-view/list-view.component';
import { RequestDetailComponent } from './request-detail/request-detail.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: ':orgId/request-details/:reqId',
        component: RequestDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestsRoutingModule {}
