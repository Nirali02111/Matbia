import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IConfig, NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { MatbiaInputModule } from '@matbia/matbia-input/matbia-input.module';
import { MatbiaDirectiveModule } from '@matbia/matbia-directive/matbia-directive.module';
import { MatbiaListRowItemModule } from '@matbia/matbia-list-row-item/matbia-list-row-item.module';
import { MatbiaDataGridModule } from '@matbia/matbia-data-grid/matbia-data-grid.module';

import { ProcessTokenRoutingModule } from './process-token-routing.module';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ProcessTokenRoutingModule,
    MatbiaInputModule,
    MatbiaDirectiveModule,
    MatbiaListRowItemModule,
    MatbiaDataGridModule,
  ],

  providers: [provideNgxMask()],
})
export class ProcessTokenModule {}
