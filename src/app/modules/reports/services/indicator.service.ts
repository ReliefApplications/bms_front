import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/network/http.service';
// Constants
import { URL_BMS_API } from '../../../../environments/environment';



@Injectable({
    providedIn: 'root'
})
export class IndicatorService {
    readonly api = URL_BMS_API + '/indicators';

    constructor(
        public http: HttpService
    ) { }

    public getIndicators(body?: any) {
        const url = this.api;
        return this.http.post(url, body);
    }

    public getIndicator(idIndicator: number) {
        const url = this.api + '/' + idIndicator;
        return this.http.get(url);
    }

    public serveIndicator(body: any, id) {
        const url = this.api + '/serve/' + id;
        return this.http.post(url, body);
    }

    public getAllGraphs(filters: object) {
        this.formatFilters(filters);
        const url = `${this.api}/filtered`;
        const options = {
            params: filters
        };
        return this.http.get(url, options);
    }

    public exportReportData(filters: object, fileType: string) {
        this.formatFilters(filters);
        const url = `${URL_BMS_API}/export?reporting=true&type=${fileType}`;
        return this.http.post(url, filters, {responseType: 'blob'});
    }

    private formatFilters(filters: object) {
        filters['projects'] = filters['projects'] ? filters['projects'].join(',') : '';
        filters['distributions'] = filters['distributions'] ? filters['distributions'].join(',') : '';
        filters['period'] = filters['period'] ? filters['period'].join(',') : '';
    }
}
