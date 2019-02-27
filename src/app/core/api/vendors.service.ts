import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class VendorsService {
	readonly api = URL_BMS_API;

	constructor(
		private http: HttpService,
	) {
	}

	public get() {
		let url = this.api + "/vendors";
		return this.http.get(url);
	}

	public update(id:number, body: any) {
		let url = this.api + "/vendors/" + id;
		return this.http.post(url, body);
	}
	
	public delete(id: number) {
		let url = this.api + "/vendors/" + id + "/archive";
		return this.http.post(url, {});
	}
}
