/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';
import { CountryInterceptor } from './country-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { SwInterceptor } from './sw-interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CountryInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: SwInterceptor, multi: true },
];
