import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { URL_BMS_API } from 'src/environments/environment';
import { WsseService } from '../authentication/wsse.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private _wsseService: WsseService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // Do not add headers on salt request
        if (req.url.match(URL_BMS_API) && !/salt/.test(req.url) && !req.headers.get('x-wsse')) {
            let user;
            // On login pass the user credentials to the wsse service
            if (/login/.test(req.url)) {
                user = {
                    email: req.body.username,
                    password: req.body.password
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
