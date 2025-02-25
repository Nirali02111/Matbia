import { Component, OnInit } from '@angular/core';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-release-update',
  templateUrl: './release-update.component.html',
  styleUrls: ['./release-update.component.scss'],
  imports: [SharedModule],
})
export class ReleaseUpdateComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
