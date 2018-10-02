import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

import { DistributionData                           } from '../../model/distribution-data';
import { Project                                    } from '../../model/project';
import { Location                                   } from '../../model/location';
import { Sector                                     } from '../../model/sector';

@Injectable({
	providedIn: 'root'
})
export class CriteriaService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/distributions/criteria";
        return this.http.get(url);
    }

    public getBeneficiariesNumber(distributionType: string, criteriaArray:any, threshold: number, project: string){
        let body = { "distribution_type" : distributionType, "criteria" : criteriaArray, "threshold": threshold }
        let url = this.api + "/distributions/criteria/project/"+project+"/number";
        return this.http.post(url, body);
    }

    /**
     * get the lit of vulnerability criteria
     */
    public getVulnerabilityCriteria() {
        let url = this.api + "/vulnerability_criteria";
        return this.http.get(url);
    }
}