import { Component, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [SharedModule],
})
export class ForgotPasswordComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
