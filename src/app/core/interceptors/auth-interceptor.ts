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
		// Do not add headers on salt request
		if (!/salt/.test(req.url)) {
			let user;
			// On login pass the user credentials to the wsse service
			if (/login/.test(req.url)) {
				user = {
					username: req.body.username,
					salted_password: req.body.salted_password
				};
			}
			// Get the auth token from the service.
			const header = this._wsseService.getHeaderValue(user);
			// Clone the request and replace the original headers with
			// cloned headers, updated with the authorization.
			const authReq = req.clone({ setHeaders: { 'x-wsse': header } });
			// send cloned request with header to the next handler.
			return next.handle(authReq);
		}

		return next.handle(req);
	}
}
