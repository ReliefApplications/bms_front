import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class WingService {
	readonly api = URL_BMS_API;

	constructor(
		private http: HttpService,
	) {
	}

	public get() {
		let url = this.api + "/financial/provider";
		return this.http.get(url);
	}

	public update(body) {
		let url = this.api + "/financial/provider";
		return this.http.post(url, { username: body['username'], password: body['password'] });
	}
}
