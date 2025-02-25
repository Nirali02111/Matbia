import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderTokenBookComponent } from './order-token-book.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: OrderTokenBookComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderTokenBookRoutingModule {}
