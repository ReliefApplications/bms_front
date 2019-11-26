import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_BMS_API } from 'src/environments/environment';

@Injectable()
export class SwInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (req.url.match(URL_BMS_API)) {
            // Add this header to bypass the service worker for requests to the backend
            return next.handle(
                req.clone({
                    headers: req.headers.append('ngsw-bypass', ''),
                })
            );
        }
        return next.handle(req);
    }
}
