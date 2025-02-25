import { NgModule } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';

import { MatbiaAlertSettingFormGroupService } from './matbia-alert-setting-form-group.service';

@NgModule({
  declarations: [],
  imports: [],

  exports: [],

  providers: [MatbiaAlertSettingFormGroupService, provideNgxMask()],
})
export class MatbiaAlertSettingModule {}
