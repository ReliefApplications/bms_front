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
        const url = this.api + "/booklets";
        return this.http.get(url);
    }

    public create(body: any) {
        const url = this.api + "/booklet";
        return this.http.put(url, body);
    }

    public update(id: number, body: any) {
        const url = this.api + "/booklets/" + id;
        return this.http.post(url, body);
    }

    public delete(id: number) {
        const url = this.api + "/booklets/" + id;
        return this.http.delete(url);
    }

    public setPassword(id: string, body: any) {
        const url = this.api + `/booklets/${id}/password`;
        return this.http.post(url, body);
    }

    public assignBenef(body: any, idBeneficiary: number) {
        const url = this.api + "/booklets/assign/" + idBeneficiary;
        return this.http.post(url, body);
    }
}
