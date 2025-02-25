import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessTokenViewComponent } from './process-token-view/process-token-view.component';
import { leaveTokenProcessGuard } from '@commons/guards/leave-token-process.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProcessTokenViewComponent,
        canDeactivate: [leaveTokenProcessGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessTokenRoutingModule {}
