import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class ProjectService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/projects";
        return this.http.get(url);
    }
}