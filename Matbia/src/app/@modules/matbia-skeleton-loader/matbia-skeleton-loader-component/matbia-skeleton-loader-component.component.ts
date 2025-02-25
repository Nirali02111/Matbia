import { Component, Input } from '@angular/core';
import { NgxSkeletonLoaderConfig, NgxSkeletonLoaderConfigTheme, NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-matbia-skeleton-loader-component',
  templateUrl: './matbia-skeleton-loader-component.component.html',
  styleUrls: ['./matbia-skeleton-loader-component.component.scss'],
  imports: [SharedModule, NgxSkeletonLoaderModule],
})
export class MatbiaSkeletonLoaderComponentComponent {
  @Input() count: NgxSkeletonLoaderConfig['count'] = 6;

  @Input() theme!: NgxSkeletonLoaderConfigTheme;
}
