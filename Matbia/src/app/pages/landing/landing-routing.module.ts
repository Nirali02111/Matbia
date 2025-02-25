import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NeedAuthGuardGuard } from '@commons/guards/need-auth-guard.guard';

import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { LayoutComponent } from './layout/layout.component';
import { DonorGuideComponent } from './donor-guide/donor-guide.component';
import { LegalPageComponent } from './legal-page/legal-page.component';
import { NonProfitsComponent } from './non-profits/non-profits.component';
import { SiteMapComponent } from './site-map/site-map.component';
import { PrivacyAndPolicyComponent } from './privacy-and-policy/privacy-and-policy.component';
import { ProgramPoliciesForUsersComponent } from './program-policies-for-users/program-policies-for-users.component';
import { PrivacyPolicyForCaliforniaResidentsComponent } from './privacy-policy-for-california-residents/privacy-policy-for-california-residents.component';
import { ValidateCardComponent } from './validate-card/validate-card.component';
import { SetupCardSettingComponent } from './setup-card-setting/setup-card-setting.component';
import { SetupBusinessComponent } from './setup-business/setup-business.component';
import { ValidateOrganizationComponent } from './validate-organization/validate-organization.component';
import { ResourcesComponent } from './resources/resources.component';
import { ReleaseUpdateComponent } from './release-update/release-update.component';
import { SignupComponent } from './signup/signup.component';
import { SendCardComponent } from './send-card/send-card.component';
import { SignupCardComponent } from './signup-card/signup-card.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { SetupOrgSettingComponent } from './setup-org-setting/setup-org-setting.component';
import { SetupAlertSettingComponent } from './setup-alert-setting/setup-alert-setting.component';
import { DonateToOrganizationComponent } from './donate-to-organization/donate-to-organization.component';
import { ToProcessTokenComponent } from './to-process-token/to-process-token.component';
import { SendMeEmailComponent } from './send-me-email/send-me-email.component';
import { CardEmailLoginScenariosComponent } from './card-email-login-scenarios/card-email-login-scenarios.component';
import { CardSetupAccountPageComponent } from './card-setup-account-page/card-setup-account-page.component';
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component';
import { EnterPasswordPageComponent } from '../authentication/enter-password-page/enter-password-page.component';
import { CardLoginPageComponent } from '../authentication/card-login-page/card-login-page.component';
import { SurveyFormComponent } from './survey-form/survey-form.component';
import { ActivateCardComponent } from '../user-panel/activate-card/activate-card/activate-card.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'enter-password',
        component: EnterPasswordPageComponent,
      },
      {
        path: 'card-login',
        component: CardLoginPageComponent,
      },
      {
        path: 'about-us',
        component: AboutUsComponent,
      },
      {
        path: 'contact',
        component: ContactPageComponent,
      },

      {
        path: 'donor-guide',
        component: DonorGuideComponent,
      },

      {
        path: 'non-profits',
        component: NonProfitsComponent,
      },

      {
        path: 'legal',
        component: LegalPageComponent,
      },

      {
        path: 'site-map',
        component: SiteMapComponent,
      },

      {
        path: 'privacy-and-policy',
        component: PrivacyAndPolicyComponent,
      },

      {
        path: 'privacy-and-policy-for-california-residents',
        component: PrivacyPolicyForCaliforniaResidentsComponent,
      },

      {
        path: 'program-policies-for-users',
        component: ProgramPoliciesForUsersComponent,
      },

      {
        path: 'resources',
        component: ResourcesComponent,
      },

      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'org-signup',
        component: SignupComponent,
      },
      {
        path: 'signup-card',
        component: SignupCardComponent,
      },
      {
        path: 'create-account',
        component: CreateAccountComponent,
      },
      {
        path: 'validate-card',
        component: ValidateCardComponent,
      },

      {
        path: 'setup-card-setting',
        component: SetupCardSettingComponent,
        canActivate: [NeedAuthGuardGuard],
      },

      {
        path: 'setup-org-setting',
        component: SetupOrgSettingComponent,
        canActivate: [NeedAuthGuardGuard],
      },

      {
        path: 'send-me-card',
        component: SendCardComponent,
        canActivate: [NeedAuthGuardGuard],
      },
      {
        path: 'activate-card',
        component: ActivateCardComponent,
      },
      {
        path: 'setup-alert-setting',
        component: SetupAlertSettingComponent,
        canActivate: [NeedAuthGuardGuard],
      },

      {
        path: 'setup-business',
        component: SetupBusinessComponent,
      },

      {
        path: 'validate-organization/:orgId',
        component: ValidateOrganizationComponent,
      },

      {
        path: 'update',
        component: ReleaseUpdateComponent,
      },

      {
        path: 'survey_1',
        component: SurveyFormComponent,
      },

      {
        path: 'tzedakahtoken',
        component: ToProcessTokenComponent,
      },

      {
        path: 'req',
        redirectTo: '/dashboard/requests',
      },

      {
        path: 'd/:orgId',
        component: DonateToOrganizationComponent,
      },
      {
        path: 'send-me-email',
        component: SendMeEmailComponent,
      },
      {
        path: 'scenarios',
        component: CardEmailLoginScenariosComponent,
      },
      {
        path: 'account-found',
        component: CardSetupAccountPageComponent,
      },
      {
        path: 'create-account-page',
        component: CreateAccountPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingRoutingModule {}
