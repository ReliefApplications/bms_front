import { Injectable } from '@angular/core';
import {
	HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

@Injectable()
export class CountryInterceptor implements HttpInterceptor {

	constructor() { }

	intercept(req: HttpRequest<any>, next: HttpHandler) {
			// Clone the request and add the country header.
			// TODO: Change so the country id is fetched from the cache
			const newReq = req.clone({ headers: req.headers.append('country', 'KHM') });
			// send cloned request with header to the next handler.
			return next.handle(newReq);
	}
}
