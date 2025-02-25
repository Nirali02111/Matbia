import { Component, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-current-batch-row-item',
  templateUrl: './current-batch-row-item.component.html',
  styleUrls: ['./current-batch-row-item.component.scss'],
  imports: [SharedModule],
})
export class CurrentBatchRowItemComponent implements OnInit {
  ngOnInit(): void {}
}
