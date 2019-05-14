import { Injectable } from '@angular/core';
import { HttpService } from '../../../core/network/http.service';

// Constants
import { URL_BMS_API } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';
import { Indicator } from 'src/app/models/indicator';

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

    public exportReportData(indicatorsId: number[], frequency: string, projectsId: number[], distributionsId: number[], fileType: string) {
        const body = {
            indicators: indicatorsId,
            frequency: frequency,
            projects: projectsId,
            distributions: distributionsId
        };
        const url = `${URL_BMS_API}/export?reporting=true&type=${fileType}`;
        return this.http.post(url, body, {responseType: 'blob'});
    }
}
