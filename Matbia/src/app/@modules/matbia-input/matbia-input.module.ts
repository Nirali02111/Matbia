import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatbiaDirectiveModule, NgxMaskDirective, NgxMaskPipe],
  exports: [],

  providers: [provideNgxMask()],
})
export class MatbiaInputModule {}
