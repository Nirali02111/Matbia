import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardLoginComponent } from './card-login/card-login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EnterPasswordPageComponent } from './enter-password-page/enter-password-page.component';
import { CardLoginPageComponent } from './card-login-page/card-login-page.component';

const TOKEN_ID = 'token';
const CARD_ID = 'card';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'orglogin',
        component: LoginComponent,
      },
      {
        path: 'forgotpassword',
        component: ForgotPasswordComponent,
      },
      {
        path: `resetpass/:${TOKEN_ID}`,
        component: ResetPasswordComponent,
      },

      {
        path: `card-login/:${CARD_ID}`,
        component: CardLoginComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
