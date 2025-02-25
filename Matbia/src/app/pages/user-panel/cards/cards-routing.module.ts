import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAdditionalCardComponent } from './add-additional-card/add-additional-card.component';
import { CardDetailComponent } from './card-detail/card-detail.component';

import { ListViewComponent } from './list-view/list-view.component';
import { CardRequestViewComponent } from './card-request-view/card-request-view.component';
import { ActivateCardComponent } from '../activate-card/activate-card/activate-card.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: 'add',
        component: ActivateCardComponent,
      },
      {
        path: 'request',
        component: CardRequestViewComponent,
      },
      {
        path: ':id/card-details',
        component: CardDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CardsRoutingModule {}
