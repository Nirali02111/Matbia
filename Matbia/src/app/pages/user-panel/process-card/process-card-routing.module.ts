import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessCardViewComponent } from './process-card-view/process-card-view.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProcessCardViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessCardRoutingModule {}
