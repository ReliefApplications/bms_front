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
        console.log("entering distribution service");
        return this.http.post(url, distribution);
    }

    public delete(distributionId) {
        let url = this.api + "/distributions/archive/" + distributionId
        return this.http.post(url, '');
    }
}
