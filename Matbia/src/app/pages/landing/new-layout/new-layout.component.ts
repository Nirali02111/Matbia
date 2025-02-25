import { Component } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-new-layout',
  templateUrl: './new-layout.component.html',
  styleUrl: './new-layout.component.css',
  imports: [SharedModule],
})
export class NewLayoutComponent {}
