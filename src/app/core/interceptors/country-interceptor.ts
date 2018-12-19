import { Injectable } from '@angular/core';
import {
	HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { AsyncacheService } from '../storage/asyncache.service';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class CountryInterceptor implements HttpInterceptor {

	constructor(
        private asyncacheService: AsyncacheService,
    ) { }

	intercept(req: HttpRequest<any>, next: HttpHandler) {
        //console.log('entered');
        return this.asyncacheService.get(AsyncacheService.COUNTRY).pipe(
            concatMap(
                (cacheResult : string) =>
                    // Clone the request and add the country header.
                    // Send cloned request with header to the next handler.            
                    next.handle( req.clone({ headers: req.headers.append('country', cacheResult )}))
            )
        );
	}
}
