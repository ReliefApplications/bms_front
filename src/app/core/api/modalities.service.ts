import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class ModalitiesService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService
    ) {
    }

    public getModalities() {
        const url = this.api + '/modalities';
        return this.http.get(url);
    }

    public getModalitiesType(modalities_id: string) {
        const url = this.api + '/modalities/' + modalities_id + '/types';
        return this.http.get(url);
    }
}
