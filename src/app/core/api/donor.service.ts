import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class DonorService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService
    ) {
    }

    public get() {
        const url = this.api + '/donors';
        return this.http.get(url);
    }

    public update(id: number, body: any) {
        const url = this.api + '/donors/' + id;
        return this.http.post(url, body);
    }

    public create(id: number, body: any) {
        const url = this.api + '/donors';
        return this.http.put(url, body);
    }

    public delete(id: number) {
        const url = this.api + '/donors/' + id;
        return this.http.delete(url);
    }
}
