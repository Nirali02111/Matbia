import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { Assets } from '@enum/Assets';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule],
})
export class ListViewComponent implements OnInit {
  data: Array<any> = [
    {
      name: 'Keren Eizer',
      email: 'info@kereneizer.com',
    },

    {
      name: 'Khal Adas Yeriem',
      email: 'adasyeriemvien@gmail.com',
    },

    {
      name: 'Keren Chasanim D’satmar',
      email: 'kerenchasanims.satmar@gmail.com',
    },

    {
      name: 'Ahavas Tzion',
      email: 'info@ahavastzion.com',
    },

    {
      name: 'Kollel',
      email: 'kollel@khalyetevlev.com',
    },
  ];

  profileIcon = Assets.PROFILE_IMAGE;

  constructor(private router: Router, private activateRoute: ActivatedRoute, private pageRoute: PageRouteVariable) {}

  ngOnInit(): void {}

  getDonateRouterLink() {
    return this.pageRoute.getDonateRouterLink();
  }

  sendMoneyTo() {
    this.router.navigate([1, 'transfer'], { relativeTo: this.activateRoute });
  }
}
