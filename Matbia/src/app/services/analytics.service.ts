import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare const gtag: any;

type gaLoginEventMethod = 'Google' | 'Auth';

type gaEventsName = 'login' | 'signed-up' | 'added-funds' | 'bank-connected' | 'card-requested' | 'campaign_details';

type gaCampaignEventPayload = {
  id?: string;
  campaign: string;
  source: string;
  medium: string;
  term?: string;
  content?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  protected readonly _SCRIPT_ID: string = 'matbiaGoogleAnalyticsApiScript';

  constructor() {
    this.load().then(() => {
      console.log('initialize Analytics');
    });
  }

  private loadScript(id: string, src: string, onload: any): void {
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const signInJS = (document as any).createElement('script');
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      (document as any).head.appendChild(signInJS);
    }
  }

  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const key = environment.GOOGLE_ANALYTIC_API_KEY;
        this.loadScript(this._SCRIPT_ID, `https://www.googletagmanager.com/gtag/js?id=${key}`, () => {
          gtag('js', new Date());
          gtag('config', key, { send_page_view: false });
          resolve();
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  initLoginEvent(name: gaLoginEventMethod) {
    this.pushEvent('login', {
      method: name,
    });
  }

  initSignUpEvent() {
    this.pushEvent('signed-up');
  }

  initAddFundsEvent() {
    this.pushEvent('added-funds');
  }

  initBankConnectedEvent() {
    this.pushEvent('bank-connected');
  }

  initCardRequestEvent() {
    this.pushEvent('card-requested');
  }

  initCampaignDetails(campaignName: string, campaignDetailsData: gaCampaignEventPayload) {
    gtag('set', campaignName, {
      ...campaignDetailsData,
    });
  }

  private pushEvent(name: gaEventsName, eventData: any = {}) {
    gtag('event', name, {
      ...eventData,
    });
  }
}
