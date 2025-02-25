import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

@Directive({
  selector: '[appBusinessDonorAccessControl]',
})
export class BusinessDonorAccessControlDirective implements OnInit, OnDestroy {
  constructor(
    private templateReference: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private localStorageService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.localStorageService.isBusinessDonor()
      ? this.viewContainerRef.createEmbeddedView(this.templateReference)
      : this.viewContainerRef.clear();
  }

  ngOnDestroy(): void {}
}
