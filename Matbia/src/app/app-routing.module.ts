import { Injectable, NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { ProfileActivationGuard } from '@commons/guards/profile-activation.guard';
import { NeedAuthGuardGuard } from '@commons/guards/need-auth-guard.guard';
import { PageRouteVariable } from '@commons/page-route-variable';

@Injectable({
  providedIn: 'root',
})
export class RequestCountResolver {}

const routes: Routes = [
  {
    path: PageRouteVariable.LandingPageUrl,
    loadChildren: () => import('./pages/landing/landing.module')?.then((m) => m.LandingModule),
  },
  {
    path: PageRouteVariable.AuthMainUrl,
    loadChildren: () => import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule),
  },
  {
    path: PageRouteVariable.DashboardUrl,
    canActivate: [NeedAuthGuardGuard, ProfileActivationGuard],
    loadChildren: () => import('./pages/user-panel/user-panel.module').then((m) => m.UserPanelModule),
  },
  { path: 'Redeem', redirectTo: '/dashboard/process-token', pathMatch: 'full' },
  { path: 'redeem', redirectTo: '/dashboard/process-token', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: PageRouteVariable.LandingPageUrl,
  },
];

const config: ExtraOptions = {
  useHash: false,
  scrollPositionRestoration: 'top',
};
@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
