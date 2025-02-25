import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SharedModule } from '@matbia/shared/shared.module';
import { BusinessProfileComponent } from '../business-profile/business-profile.component';
import { DonorProfileComponent } from '../donor-profile/donor-profile.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  imports: [SharedModule, BusinessProfileComponent, DonorProfileComponent],
})
export class ListViewComponent implements OnInit {
  constructor(protected title: Title, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.title.setTitle('Matbia - Profile');
  }
}
