import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { WsseService } from './wsse.service';

import { URL_BMS_API } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthenticationService {

	constructor(
		public _wsseService: WsseService,
		public http: HttpClient
	) { }

	// Request to the API to get the salt corresponding to a username
	requestSalt(username) {
		this._wsseService.setUsername(username);
		return this.http.get(URL_BMS_API + '/salt?username=' + username);
	}

	checkCredentials() {
		return this.http.get<any>(URL_BMS_API + '/check');
	}

	login(username, password) {
		this.requestSalt(username).subscribe(
			success => {
				let saltedPassword = this._wsseService.saltPassword(success, password);
				this.checkCredentials().subscribe(
					success => {
						console.log("Successfully logged in", success);
					},
					error => {
						console.log("Wrong password", error);
					}
				);
			},
			error => {
				console.log("Wrong email", error);
			}
		);
	}
}
