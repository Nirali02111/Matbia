import { UrlHandlingStrategy, UrlTree } from '@angular/router';
import { Params } from '@enum/Params';
import { environment } from 'src/environments/environment';

export class MatbiaUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    return true;
  }
  extract(url: UrlTree): UrlTree {
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree) {
    if (
      rawUrl.queryParamMap.has(Params.SHUL_KIOSK) ||
      rawUrl.queryParamMap.has(Params.BLOCK_BANK_MANAGEMENT) ||
      rawUrl.queryParamMap.has(Params.BLOCK_PLAID) ||
      rawUrl.queryParamMap.has(Params.UTM_CAMPAIGN) ||
      rawUrl.queryParamMap.has(Params.UTM_MEDIUM) ||
      rawUrl.queryParamMap.has(Params.UTM_SOURCE) ||
      rawUrl.queryParamMap.has(Params.UTM_ID)
    ) {
      if (rawUrl.queryParams[Params.SHUL_KIOSK]) {
        newUrlPart.queryParams[Params.SHUL_KIOSK] = true;
      }

      if (rawUrl.queryParamMap.has(Params.BLOCK_BANK_MANAGEMENT)) {
        newUrlPart.queryParams[Params.BLOCK_BANK_MANAGEMENT] =
          String(rawUrl.queryParams[Params.BLOCK_BANK_MANAGEMENT]).toLowerCase() === 'true' ? true : false;
      }

      if (rawUrl.queryParamMap.has(Params.BLOCK_PLAID)) {
        newUrlPart.queryParams[Params.BLOCK_PLAID] =
          String(rawUrl.queryParams[Params.BLOCK_PLAID]).toLowerCase() === 'true' ? true : false;
      }

      if (rawUrl.queryParams[Params.UTM_CAMPAIGN] && environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER) {
        newUrlPart.queryParams[Params.UTM_CAMPAIGN] = rawUrl.queryParams[Params.UTM_CAMPAIGN];
      }

      if (rawUrl.queryParams[Params.UTM_MEDIUM] && environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER) {
        newUrlPart.queryParams[Params.UTM_MEDIUM] = rawUrl.queryParams[Params.UTM_MEDIUM];
      }

      if (rawUrl.queryParams[Params.UTM_SOURCE] && environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER) {
        newUrlPart.queryParams[Params.UTM_SOURCE] = rawUrl.queryParams[Params.UTM_SOURCE];
      }

      if (rawUrl.queryParams[Params.UTM_ID] && environment.GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER) {
        newUrlPart.queryParams[Params.UTM_ID] = rawUrl.queryParams[Params.UTM_ID];
      }

      return newUrlPart;
    }

    return newUrlPart;
  }
}
