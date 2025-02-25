import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageRouteVariable } from '@commons/page-route-variable';
import { Assets } from '@enum/Assets';
const PARAM_ID = 'id';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  imports: [SharedModule],
})
export class TransferComponent implements OnInit {
  profileIcon = Assets.PROFILE_IMAGE;
  constructor(private pageRoute: PageRouteVariable, private activeRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((params) => {
      const id = params.get(PARAM_ID);
    });
  }

  getInternalTransferRouterLink() {
    return this.pageRoute.getInternalTransferRouterLink();
  }
}
