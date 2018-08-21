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
export class DistributionService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/distributions";
        return this.http.get(url);
    }

    public getByProject(idProject) {
        let url = this.api + "/distributions/projects/"+idProject;
        return this.http.get(url);
    }

    public update(id: number, distribution: DistributionData) {
        let url = this.api + "/distributions/" + id;
        console.log("entering distribution service", distribution);
        return this.http.post(url, distribution);
    }

    public delete(distributionId) {
        let url = this.api + "/distributions/archive/" + distributionId
        return this.http.post(url, '');
    }

    public add(body: any) {
        let url = this.api + "/distributions";
        return this.http.put(url, body);
    }

    /**
     * TODO: Add route to export distribution
     * Export data of distribution in CSV
     */
    public export() {
        let url = this.api + "/distributions/export";
        return this.http.get(url);
    }
}
