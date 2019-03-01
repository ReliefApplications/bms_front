import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';
import { Vendors } from '../../model/vendors';
import { HttpService } from './http.service';
import { ExportService } from '../../core/api/export.service';

@Injectable({
    providedIn: 'root'
})
export class VendorsService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        public _exportService: ExportService
    ) {
    }

    public get() {
        const url = this.api + '/vendors';
        return this.http.get(url);
    }

    public update(id: number, body: any) {
        const url = this.api + '/vendors/' + id;
        return this.http.post(url, body);
    }

    public delete(id: number) {
        const url = this.api + '/vendors/' + id + '/archive';
        return this.http.post(url, {});
    }

    public print(vendor: Vendors) {
        return this._exportService.printInvoice(parseInt(vendor.id, 10));
    }
}
