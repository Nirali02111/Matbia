import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * List of components as directives selectors
 */
/**
 *
 */
import { ClipboardModule } from '@angular/cdk/clipboard';
import { LayoutModule } from '@angular/cdk/layout';

import { GoogleMapService, WindowRef, DocumentRef } from '@services/google-map.service';

export const BROWSER_GLOBALS_PROVIDERS: Provider[] = [WindowRef, DocumentRef];

@NgModule({
  declarations: [],
  imports: [CommonModule, LayoutModule, ClipboardModule],
  exports: [],
  providers: [...BROWSER_GLOBALS_PROVIDERS, GoogleMapService],
})
export class MatbiaDirectiveModule {}
