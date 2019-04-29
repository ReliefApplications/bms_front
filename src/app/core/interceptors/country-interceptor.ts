import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap } from 'rxjs/operators';
import { URL_BMS_API } from 'src/environments/environment';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable()
export class CountryInterceptor implements HttpInterceptor {

    constructor(
        private asyncacheService: AsyncacheService,
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        if (req.url.match(URL_BMS_API)) {
            return this.asyncacheService.get(AsyncacheService.COUNTRY).pipe(
                concatMap(
                    (cacheResult: string) => {
                        if (cacheResult) {
                        // Clone the request and add the country header.
                        // Send cloned request with header to the next handler.
                            return next.handle( req.clone({ headers: req.headers.append('country', cacheResult )}));
                        } else {
                            return next.handle(req);
                        }

                    }
                )
            );
        }
        return next.handle(req);

    }
}
