import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

import { DistributionData                           } from '../../model/distribution-data';
import { Project                                    } from '../../model/project';
import { Location                                   } from '../../model/location';
import { Sector                                     } from '../../model/sector';
import { Beneficiaries } from '../../model/beneficiary';

@Injectable({
	providedIn: 'root'
})
export class DistributionService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService
    ) {
    }

    public get() {
        const url = this.api + '/distributions';
        return this.http.get(url);
    }

    public getOne(id: number) {
        const url = this.api + '/distributions/' + id;
        return this.http.get(url);
    }

    public getByProject(idProject) {
        const url = this.api + '/distributions/projects/' + idProject;
        return this.http.get(url);
    }

    public update(id: number, distribution: DistributionData) {
        const url = this.api + '/distributions/' + id;
        return this.http.post(url, distribution);
    }

    public delete(distributionId) {
        const url = this.api + '/distributions/archive/' + distributionId;
        return this.http.post(url, '');
    }

    public add(body: any) {
        const url = this.api + '/distributions';
        return this.http.put(url, body);
    }

    public getBeneficiaries(id: number) {
        const url = this.api + '/distributions/' + id + '/beneficiaries';
        return this.http.get(url);
    }

    public setValidation(id: number) {
        const url = this.api + '/distributions/' + id + '/validate';
        return this.http.get(url);
    }

    /**
     * TODO: Add route to export distribution
     * Export data of distribution in CSV
     */
    public export(option: string, id: number) {
        if (option === 'project') {
            const url = this.api + '/export?project=' + id;
            return this.http.get(url);
        } else if (option === 'distribution') {
            const url = this.api + '/export?beneficiariesInDistribution=' + id;
            return this.http.get(url);
        }
    }
}
