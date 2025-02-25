import { Component, Input, OnInit } from '@angular/core';
import { TokenStatus } from '@enum/Token';
import { ProcessTokenObj } from '@services/API/organization-token-api.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-process-token-list-row-item',
  templateUrl: './process-token-list-row-item.component.html',
  styleUrls: ['./process-token-list-row-item.component.scss'],
  imports: [SharedModule],
})
export class ProcessTokenListRowItemComponent implements OnInit {
  @Input() item!: ProcessTokenObj;

  get isGenerated() {
    return this.item.status === TokenStatus.GENERATED;
  }

  get iExpired() {
    return this.item.status === TokenStatus.EXPIRED;
  }

  get isVoided() {
    return this.item.status === TokenStatus.VOIDED;
  }

  constructor() {}

  ngOnInit(): void {}
}
