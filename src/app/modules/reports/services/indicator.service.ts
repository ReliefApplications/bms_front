import { Injectable } from '@angular/core';
import { HttpService } from '../../../core/api/http.service';

// Constants
import { URL_BMS_API } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';
import { Indicator } from 'src/app/model/indicator';

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

    public exportReportData(graphsToExportId: Indicator[], filters: any) {
        const requests = graphsToExportId.map(indicator => {
            const url = `${this.api}/export/${indicator.id}`;
            return this.http.post(url, filters, {responseType: 'blob'});
        });

        return forkJoin(requests);
    }
}
