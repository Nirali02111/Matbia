import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/API/auth.service';
import { LocalStorageDataService } from './local-storage-data.service';
import { PageRouteVariable } from './page-route-variable';
import { UserTypes } from '@enum/UserTypes';
declare var $: any;
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private messagedisplayed = false;
  private refreshTokenSubject: Subject<any> = new BehaviorSubject<any>(null);

  landingPageUrl: string = PageRouteVariable.AuthLoginUrl;
  constructor(
    private router: Router,
    private localStorageDataService: LocalStorageDataService,
    private authService: AuthService
  ) {}

  isOpenUrl(request: HttpRequest<any>): boolean {
    if (request.url.toLowerCase().includes('v1/donortrans/savedepositauth')) {
      return true;
    }
    return (
      request.url.toLowerCase().indexOf('auth') === -1 &&
      // request.url.toLowerCase().indexOf('common') === -1 &&
      request.url.toLowerCase().indexOf('user') === -1 &&
      // request.url.toLowerCase().indexOf('business') === -1 &&
      request.url.toLowerCase().indexOf('matbiacard/validate') === -1 &&
      request.url.toLowerCase().indexOf('matbiacard/request') === -1 &&
      request.url.toLowerCase().indexOf('matbiacard/getrequests') === -1 &&
      request.url.toLowerCase().indexOf('donor/register') === -1
    );
  }

  isAgentUrl(request: HttpRequest<any>): boolean {
    if (request.url.toLowerCase().indexOf('dynamicgridreport/getall') !== -1) {
      return true;
    }

    if (request.url.toLowerCase().indexOf('dynamicgridreport/getparams') !== -1) {
      return true;
    }

    if (request.url.toLowerCase().indexOf('dynamicgridreport/execute') !== -1) {
      return true;
    }

    if (request.url.toLowerCase().indexOf('csagent/csagentlogin') !== -1) {
      return true;
    }

    if (request.url.toLowerCase().indexOf('csagent/getcsagentrecentlogs') !== -1) {
      return true;
    }

    return false;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accesstoken = this.localStorageDataService.getLoginUserAccessToken();
    const baseUrl = environment.baseUrl;

    // if current url is not login url
    if (this.isOpenUrl(request)) {
      const reportUserData = this.localStorageDataService.getReportData();

      if (
        this.isAgentUrl(request) &&
        reportUserData &&
        reportUserData.userType === UserTypes.REPORT &&
        reportUserData.accessToken
      ) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + reportUserData.accessToken,
          },
        });
      } else {
        if (accesstoken) {
          request = request.clone({
            setHeaders: {
              Authorization: 'Bearer ' + accesstoken,
            },
          });
        }
      }
    }

    if (request.url.toLowerCase().indexOf('auth/shulkiosk/setpassword') !== -1) {
      if (accesstoken) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + accesstoken,
          },
        });
      }
    }

    if (request.url.toLowerCase().indexOf('donate/getorg') !== -1) {
      request = request.clone({
        setHeaders: {
          Authorization: environment.DONATE_API_TOKEN,
        },
      });
    }

    if (request.url.toLowerCase().indexOf('matbia/charge') !== -1) {
      request = request.clone({
        setHeaders: {
          Authorization: environment.MATBIA_API_TOKEN,
        },
      });
    }

    if (request.url.toLowerCase().indexOf('matbia/schedule') !== -1) {
      request = request.clone({
        setHeaders: {
          Authorization: environment.MATBIA_API_TOKEN,
        },
      });
    }

    if (!request.headers.has('Content-Type')) {
      request = request.clone({
        setHeaders: {
          // 'content-type': 'application/json'
        },
      });
    }
    request = request.clone({
      headers: request.headers.set('Accept', 'application/json'),
    });
    if (request.url.toLowerCase().indexOf('shippingapi') === -1 && request.url.toLowerCase().indexOf('jsonip') === -1) {
      if (request.url == 'https://api.jotform.com/formInitCatchLogger/243164690867164') {
        request = request.clone({ url: `${request.url}` });
      } else {
        request = request.clone({ url: `${baseUrl}${request.url}` });
      }
    } else {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/xml',
          Accept: 'text/xml',
        },
      });
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
        this.messagedisplayed = false;
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const tokenexpired = error.headers.get('Token-Expired');
          if (tokenexpired != null && tokenexpired !== '') {
            return this.handle401Error(request, next);
          } else {
            this.redirectToHome();
          }
        } else {
          // console.log(error);
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;
      this.refreshTokenSubject.next(null);

      const accessToken = this.localStorageDataService.getLoginUserAccessToken();
      const refreshToken = this.localStorageDataService.getLoginUserRefreshToken();
      const loginUserID = this.localStorageDataService.getLoginUserId();

      const modelData: any = {
        accessToken,
        refreshToken,
        LoginUserID: loginUserID,
      };

      if (accessToken)
        return this.authService.refreshToken(modelData).pipe(
          switchMap((data: any) => {
            this.refreshTokenInProgress = false;

            this.localStorageDataService.setAccessToken(data.accessToken);
            this.localStorageDataService.setRefreshToken(data.refreshToken);
            this.localStorageDataService.setTokenExpiryTime(data.expiresIn);

            this.refreshTokenSubject.next(data.accessToken);

            return next.handle(this.addTokenHeader(request, data.accessToken));
          }),
          catchError((err) => {
            this.refreshTokenInProgress = false;
            return throwError(err);
          })
        );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private redirectToHome() {
    this.localStorageDataService.setLoginUserDataAndToken(null);
    this.router.navigate([this.landingPageUrl]);
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });
  }
}
