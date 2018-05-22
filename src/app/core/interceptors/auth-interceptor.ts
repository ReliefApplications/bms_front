import { Injectable } from '@angular/core';
import {
	HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { WsseService } from '../authentication/wsse.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(
		private _wsseService: WsseService
	) { }

	intercept(req: HttpRequest<any>, next: HttpHandler) {
		// Get the auth token from the service.
		const header = this._wsseService.getHeaderValue();

		// Clone the request and replace the original headers with
		// cloned headers, updated with the authorization.
		const authReq = req.clone({ setHeaders: { 'x-wsse': header } });

		// send cloned request with header to the next handler.
		return next.handle(authReq);
	}
}
