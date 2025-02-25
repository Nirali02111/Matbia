import { Injectable } from '@angular/core';

export interface PlaidSuccessMetadata {
  link_session_id: string;
  institution: PlaidInstitutionObject;
  account: PlaidAccountObject;
  accounts: Array<PlaidAccountObject>;
  account_id: string;
  public_token: string;
}

export interface PlaidOnSuccessArgs {
  token: string;
  metadata: PlaidSuccessMetadata;
}

export interface PlaidInstitutionObject {
  name: string;
  institution_id: string;
}

export interface PlaidAccountObject {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  verification_status: string | null;
}

export interface PlaidErrorObject {
  display_message: string;
  error_code: string;
  error_message: string;
  error_type: string;
}

export interface PlaidErrorMetadata {
  link_session_id: string;
  institution: PlaidInstitutionObject;
  status: string;
}

export interface PlaidOnExitArgs {
  error: PlaidErrorObject;
  metadata: PlaidErrorMetadata;
}

export interface PlaidOnEventArgs {
  eventName: string;
  metadata: PlaidEventMetadata;
}

export interface PlaidEventMetadata {
  error_code: string;
  error_message: string;
  error_type: string;
  exit_status: string;
  institution_id: string;
  institution_name: string;
  institution_search_query: string;
  request_id: string;
  link_session_id: string;
  mfa_type: string;
  view_name: string;
  timestamp: string;
}

export interface PlaidConfig {
  apiVersion?: string;
  clientName?: string;
  env: string;
  key?: string;
  // tslint:disable-next-line: ban-types
  onLoad?: Function;
  // tslint:disable-next-line: ban-types
  onSuccess: Function;
  // tslint:disable-next-line: ban-types
  onExit: Function;
  // tslint:disable-next-line: ban-types
  onEvent?: Function;
  product: Array<string>;
  selectAccount?: boolean;
  token?: string;
  webhook?: string;
  countryCodes?: string[];
  receivedRedirectUri?: string;
  isWebview?: boolean;
}

declare let Plaid: any;

export class PlaidLinkHandler {
  /**
   * Holds the Plaid Link instance.
   */
  private plaidLink: any;

  /**
   * Constructor configures the Plaid Link handler with given config options.
   * @param PlaidConfig config
   */
  constructor(config: PlaidConfig) {
    this.plaidLink = Plaid.create(config);
  }

  /**
   * Open the Plaid Link window for this handler.
   * @param string institution The name of the institution to open
   */
  public open(institution?: string): void {
    this.plaidLink.open(institution);
  }

  /**
   * Closes the currently open Plaid Link window if any.
   */
  public exit(): void {
    this.plaidLink.exit();
  }
}

@Injectable()
export class NgxPlaidLinkService {
  private loaded!: Promise<void>;

  constructor() {}

  /**
   * Create a Plaid Link instance as soon as Plaid Link has loaded.
   * @param PlaidConfig config
   * @returns Promise<PlaidLinkHandler>
   */
  public createPlaid(config: PlaidConfig): Promise<PlaidLinkHandler> {
    return this.loadPlaid().then(() => {
      return new PlaidLinkHandler(config);
    });
  }

  /**
   * Load or wait for the Plaid Link library to load.
   * @returns Promise<void>
   */
  public loadPlaid(): Promise<void> {
    if (!this.loaded) {
      this.loaded = new Promise<void>((resolve, reject) => {
        const script: any = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        script.onerror = (e: any) => reject(e);
        if (script.readyState) {
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              resolve();
            }
          };
        } else {
          script.onload = () => {
            resolve();
          };
        }
        document.getElementsByTagName('body')[0].appendChild(script);
      });
    }

    return this.loaded;
  }
}
