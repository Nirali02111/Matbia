import { Component, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [SharedModule],
})
export class FooterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
