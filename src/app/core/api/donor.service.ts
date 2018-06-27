import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class DonorService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/donors";
        return this.http.get(url);
    }
}