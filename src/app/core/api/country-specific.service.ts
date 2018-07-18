import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class CountrySpecificService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/country_specifics";
        return this.http.get(url);
    }

    public update(id: number, body: any) {
        let url = this.api + "/country_specifics/"+id;
        return this.http.put(url, body);
    }

    public create(id: number, body: any) {
        let url = this.api + "/country_specifics";
        return this.http.put(url, body);
    }

    public delete(id: number, body: any) {
        let url = this.api + "/country_specifics/"+id;
        return this.http.delete(url, body);
    }
}