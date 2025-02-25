import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InternalTransferRoutingModule } from './internal-transfer-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, InternalTransferRoutingModule],
})
export class InternalTransferModule {}
