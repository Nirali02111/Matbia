import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule.forRoot({
      theme: {
        // Enabliong theme combination
        extendsFromRoot: true,
        width: '100%',
        height: '40px',
      },
    }),
  ],
  exports: [],
})
export class MatbiaSkeletonLoaderModule {}
