import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class UserService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/users";
        return this.http.get(url);
    }

    public update(id: number, body: any) {
        let url = this.api + "/users/"+id;
        return this.http.post(url, body);
    }
}