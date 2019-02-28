import { Injectable } from '@angular/core';

import { HttpService } from '../../../core/api/http.service';

// Constants
import { URL_BMS_API } from '../../../../environments/environment';
import { forEach } from '@angular/router/src/utils/collection';

@Injectable({
    providedIn: 'root'
})

export class ChartDataLoaderService {

    readonly api = URL_BMS_API;

    constructor(
        public http: HttpService,
    ) {

    }

    /**
	* Response of the request
	* {
	* 	 data = [
	*           {
	*              "name": "Germany",
	*             "value": 8940000
	*        },
	*       {
	*          "name": "USA",
	*         "value": 5000000
	*    }
	* ];
	*/
    load(id: string, filtres: any) {
        const body = {};
        body['filters'] = filtres;
        const url = this.api + '/indicators/serve/' + id;
        return this.http.post(url, body);
    }
}
