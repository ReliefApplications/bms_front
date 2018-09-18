import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
    ) {
    }

    public export(extensionType: string, category: string, country?: string) {
        const body = { type: extensionType };
        let url: string;

        if (category === 'projects' && country) {
            url = this.api + '/export?projects=' + country;
        } else {
            url = this.api + '/export' + '?' + category + '=true';
        }

        return this.http.post(url, body);
    }
}
