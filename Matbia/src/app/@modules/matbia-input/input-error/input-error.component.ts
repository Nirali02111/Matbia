import { Component, Input, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-input-error',
  templateUrl: './input-error.component.html',
  styleUrls: ['./input-error.component.scss'],
  imports: [SharedModule],
})
export class InputErrorComponent implements OnInit {
  @Input() errors: any;

  /**
   * Display only first Error message
   */
  @Input() firstOnly = true;

  constructor() {}

  ngOnInit(): void {}
}
