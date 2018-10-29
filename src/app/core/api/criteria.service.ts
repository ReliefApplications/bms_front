import { Injectable                                 } from '@angular/core';
import { of, Observable                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

import { DistributionData                           } from '../../model/distribution-data';
import { Project                                    } from '../../model/project';
import { Location                                   } from '../../model/location';
import { Sector                                     } from '../../model/sector';
import { CacheService } from '../storage/cache.service';
import { NetworkService } from './network.service';

@Injectable({
	providedIn: 'root'
})
export class CriteriaService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService,
        private cacheService: CacheService,
        private networkService: NetworkService,
    ){
    }

    public get() {
        let url = this.api + "/distributions/criteria";

        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.CRITERIAS);
                
                if(cacheData) {
                    observer.next(cacheData);
                }

                if(this.networkService.getStatus()) {

                    let backData;

                    this.http.get(url).subscribe(
                        result => {

                            backData = result;

                            if(backData && backData !== cacheData) {
                                observer.next(backData);
                                this.cacheService.set(CacheService.CRITERIAS, backData);
                            }
                            observer.complete();                            
                        }
                    )
                } else {
                    observer.complete();
                }
            }
        );

        return(data);
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