import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-to-process-token',
  templateUrl: './to-process-token.component.html',
  styleUrls: ['./to-process-token.component.scss'],
  imports: [SharedModule],
})
export class ToProcessTokenComponent implements OnInit {
  authUrl: string = '/' + PageRouteVariable.AuthMainUrl;

  constructor(private router: Router, private pageRoutes: PageRouteVariable) {}

  ngOnInit(): void {
    this.router.navigate([this.authUrl], {
      queryParams: { returnUrl: this.pageRoutes.getProcessTokenListRouterLink() },
    });
  }
}
