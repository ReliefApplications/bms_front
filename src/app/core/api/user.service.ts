import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';
import { WsseService                                } from '../authentication/wsse.service';

@Injectable({
	providedIn: 'root'
})
export class UserService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService,
        private _wsseService : WsseService
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

    public createStepSalt(id: number, parameters: any) {
        let url = this.api + "/salt/"+parameters.username;
        return this.http.get(url, parameters);
    }

    public createStepCreate(id: number, body: any, salt: any) {
        let saltedPassword = this._wsseService.saltPassword(salt, body.password);
        this._wsseService.setSalted(saltedPassword);
        body.password = saltedPassword;

        let url = this.api + "/users";
        return this.http.put(url, body);
    }

    public delete(id: number, body: any) {
        let url = this.api + "/users/"+id;
        return this.http.delete(url, body);
    }
}