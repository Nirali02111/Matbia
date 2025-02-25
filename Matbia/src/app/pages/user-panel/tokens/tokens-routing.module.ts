import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './list-view/list-view.component';
import { CreateTokenComponent } from './create-token/create-token.component';
import { TokenSettingsComponent } from './token-settings/token-settings.component';
import { GenerateTokenGuard } from '@commons/guards/generate-token.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListViewComponent,
      },
      {
        path: 'create-token',
        component: CreateTokenComponent,
        canActivate: [GenerateTokenGuard],
      },
      {
        path: 'settings',
        component: TokenSettingsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokensRoutingModule {}
