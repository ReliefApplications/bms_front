import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';


@Injectable({
    providedIn: 'root'
})
export class LocationService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService
    ) {
    }

    /**
     * Get all adm1
     */
    public getAdm1() {
        let url = this.api + "/location/adm1";
        return this.http.get(url);
    }

    /**
     * Get all adm2 associate to the selected adm1
     * @param body 
     */
    public getAdm2(body?: any) {
        let url = this.api + "/location/adm2";
        return this.http.post(url, body);
    }
}