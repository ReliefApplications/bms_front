import { Injectable                                 } from '@angular/core';
import { URL_BMS_API                                } from '../../../environments/environment';
import { HttpService                                } from './http.service';
import { ExportService                              } from './export.service';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class VoucherService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private exportService: ExportService,
    ) {
    }

    public get() {
        const url = this.api + '/vouchers';
        return this.http.get(url);
    }

    public getCurrencies() {
        const url = 'https://openexchangerates.org/api/currencies.json';
        return this.http.get(url);
    }
}
