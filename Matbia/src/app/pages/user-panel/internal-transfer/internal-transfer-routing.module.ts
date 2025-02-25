import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './list-view/list-view.component';
import { TransferComponent } from './transfer/transfer.component';

const PARAM_ID = 'id';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: `:${PARAM_ID}/transfer`,
        component: TransferComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternalTransferRoutingModule {}
