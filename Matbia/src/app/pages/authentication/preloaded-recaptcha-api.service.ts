import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { RECAPTCHA_V3_SITE_KEY, RECAPTCHA_BASE_URL } from 'ng-recaptcha';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    ng2recaptchaEnterloaded: () => void;
  }
}

function loadScript(
  renderMode: 'explicit' | string,
  onLoaded: (grecaptcha: ReCaptchaV2.ReCaptcha) => void,

  url?: string
): void {
  window.ng2recaptchaEnterloaded = () => {
    if (grecaptcha.enterprise) {
      onLoaded(grecaptcha.enterprise);
    } else {
      onLoaded(grecaptcha);
    }
  };
  const script = document.createElement('script');
  script.innerHTML = '';
  const baseUrl = url || 'https://www.google.com/recaptcha/api.js';

  script.src = `${baseUrl}?render=${renderMode}&onload=ng2recaptchaEnterloaded`;

  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

@Injectable()
export class PreloadedRecaptchaAPIService {
  /**
   * @internal
   * @nocollapse
   */
  private static ready: BehaviorSubject<ReCaptchaV2.ReCaptcha | null> | null = null;

  public ready: Observable<ReCaptchaV2.ReCaptcha | null>;

  private platformId: Object | undefined;

  /** @internal */
  private baseUrl: string | undefined;

  /** @internal */
  private v3SiteKey: string | undefined;

  constructor(
    @Optional() @Inject(PLATFORM_ID) platformId?: Object,

    @Optional() @Inject(RECAPTCHA_BASE_URL) baseUrl?: string,

    @Optional() @Inject(RECAPTCHA_V3_SITE_KEY) v3SiteKey?: string
  ) {
    this.baseUrl = baseUrl;

    this.v3SiteKey = v3SiteKey;
    this.platformId = platformId;

    this.init();

    this.ready = (
      this.platformId && isPlatformBrowser(this.platformId) ? PreloadedRecaptchaAPIService.ready?.asObservable() : of()
    ) as Observable<ReCaptchaV2.ReCaptcha | null>;
  }

  /** @internal */
  private init() {
    if (PreloadedRecaptchaAPIService.ready) {
      return;
    }

    const subject = new BehaviorSubject<ReCaptchaV2.ReCaptcha | null>(null);
    PreloadedRecaptchaAPIService.ready = subject;

    const renderMode = this.v3SiteKey || 'explicit';
    loadScript(renderMode, (grecaptcha) => subject.next(grecaptcha), this.baseUrl);
  }
}
