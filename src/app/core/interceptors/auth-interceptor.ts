import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { WsseService } from '../authentication/wsse.service';
import { map, concat, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private _wsseService: WsseService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        // Do not add headers on salt request
        if (!/salt/.test(req.url) && req.url !== 'https://openexchangerates.org/api/currencies.json') {
            let user;
            // On login pass the user credentials to the wsse service
            if (/login/.test(req.url)) {
                user = {
                    username: req.body.username,
                    salted_password: req.body.salted_password
                };
            }

            // Get the auth token from the service.
            return this._wsseService.getHeaderValue(user).pipe(
                switchMap(
                    header => {
                        // Clone the request & replace original headers with cloned headers, updated with the authorization.
                        const authReq = req.clone({ setHeaders: { 'x-wsse': header } });
                        // Send cloned request with header to the next handler.
                        return next.handle(authReq);
                    }
                )
            );
        }

        return next.handle(req);
    }
}
