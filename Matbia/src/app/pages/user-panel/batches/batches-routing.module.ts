import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './list-view/list-view.component';
import { CurrentBatchViewComponent } from './current-batch-view/current-batch-view.component';
import { BatchCloseViewComponent } from './batch-close-view/batch-close-view.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: 'current-batch',
        component: CurrentBatchViewComponent,
      },
      {
        path: 'batch-closing-options',
        component: BatchCloseViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BatchesRoutingModule {}
