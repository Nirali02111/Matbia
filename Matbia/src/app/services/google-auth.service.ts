import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from './../../environments/environment';
import { DocumentRef, MapsAPILoader, WindowRef } from './google-map.service';
import jwt_decode from 'jwt-decode';
import { BreakpointObserver } from '@angular/cdk/layout';
import { distinctUntilChanged, pluck } from 'rxjs/operators';

export interface SocialUser {
  email: string;
  jti: string;
}

@Injectable()
export class GoogleAuthService extends MapsAPILoader {
  protected _scriptLoadingPromise!: Promise<void>;
  protected _config!: any;
  protected _windowRef: WindowRef;
  protected _documentRef: DocumentRef;
  protected readonly _SCRIPT_ID: string = 'matbiaGoogleAuthApiScript';
  private readonly _socialUser$ = new BehaviorSubject<SocialUser | null>(null);

  constructor(w: WindowRef, d: DocumentRef, private breakpointObserver: BreakpointObserver) {
    super();

    this._windowRef = w;
    this._documentRef = d;
  }

  get socialUser$() {
    return this._socialUser$.asObservable();
  }

  private loadScript(id: string, src: string, onload: any): void {
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const signInJS = this._documentRef.getNativeDocument().createElement('script');
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      this._documentRef.getNativeDocument().head.appendChild(signInJS);
    }
  }

  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(this._SCRIPT_ID, `https://accounts.google.com/gsi/client`, () => {
          const key = environment.GOOGLE_AUTH_API_KEY;
          const window = this._windowRef.getNativeWindow() as any;
          window.google.accounts.id.initialize({
            client_id: key,
            callback: ({ credential }: { credential: string }) => {
              const socialUser: SocialUser = jwt_decode(credential);
              this._socialUser$.next(socialUser);
            },
            ux_mode: 'popup',
          });

          window.onGoogleLibraryLoad = () => {};

          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  renderGoogleButton(buttonId: string) {
    this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .pipe(pluck('matches'), distinctUntilChanged())
      .subscribe((isMached) => {
        let width = 385;
        if (isMached) {
          width = 270;
        }

        this.initButton(width, buttonId);
      });
  }

  initButton(width: number, id = 'googleButton') {
    const window = this._windowRef.getNativeWindow() as any;
    window.google.accounts.id.renderButton(this._documentRef.getNativeDocument().getElementById(id), {
      type: 'standard',
      text: 'login_with',
      theme: 'outline',
      size: 'large',
      shape: 'square',
      width: width,
    });

    window.google.accounts.id.prompt();
  }
}
