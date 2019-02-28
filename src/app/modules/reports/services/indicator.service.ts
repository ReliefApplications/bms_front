import { Injectable } from '@angular/core';

import { HttpService } from '../../../core/api/http.service';

//Constants
import { URL_BMS_API } from '../../../../environments/environment';


@Injectable({
	providedIn: 'root'
})

export class IndicatorService {
    readonly api = URL_BMS_API+'/indicators';

    constructor(
        public http: HttpService
    ) {

    }

    public getIndicators(body?:any){
        let url = this.api;
        return this.http.post(url, body);
    }

    public getIndicator(idIndicator:number){
        let url = this.api + "/"+idIndicator;
        return this.http.get(url);
    }

    public serveIndicator(body: any, id){
        let url = this.api + "/serve/" + id;
        return this.http.post(url, body);
    }
}
