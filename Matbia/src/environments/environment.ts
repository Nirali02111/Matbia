// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  baseUrl: 'https://matbiabackendapidev.azurewebsites.net/',
  version: '0.0.1',
  RECAPTCHA_V3_SITE_KEY: '6LeeHkolAAAAAD3Pc989lvzo6FGkHlnsN4XLL3nV',
  GOOGLE_MAP_API_KEY: 'AIzaSyAvMry9t3AX1S2FglQsBxvCsvGKHNJXCCU',

  GOOGLE_AUTH_API_KEY: '716530100259-7itjfk1on986sftf2q4m9l71nv47ug0l.apps.googleusercontent.com',

  GOOGLE_ANALYTIC_API_KEY: 'G-KBCTLWWGRQ',
  GOOGLE_ANALYTIC_KEEP_UTM_PARAMETER: false,

  production: false,
  PLAID_ENV: 'sandbox',

  DONATE_API_TOKEN:
    '401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429090fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1',
  MATBIA_API_TOKEN: 'DA8874A1-9393-4D59-8A79-5E436F2538A0',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
