import { Component, Input, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-button-loader',
  templateUrl: './button-loader.component.html',
  styleUrls: ['./button-loader.component.scss'],
  imports: [SharedModule],
})
export class ButtonLoaderComponent implements OnInit {
  // Label of button
  @Input() label = 'Save';

  // state for loading and un loading value
  @Input() loading = false;

  constructor() {}

  ngOnInit(): void {}
}
