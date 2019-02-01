import { Injectable                                 } from '@angular/core';
import { URL_BMS_API                                } from '../../../environments/environment';
import { HttpService                                } from './http.service';
import { ExportService                              } from './export.service';


@Injectable({
	providedIn: 'root'
})
export class BookletService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private exportService: ExportService,
    ) {
    }

    public get() {
        let url = this.api + "/booklets";
        return this.http.get(url);
    }

    public create(body) {
        let url = this.api + "/booklet";
        return this.http.put(url, body);
    }
}
