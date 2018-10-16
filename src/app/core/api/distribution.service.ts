import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

import { DistributionData                           } from '../../model/distribution-data';
import { Project                                    } from '../../model/project';
import { Location                                   } from '../../model/location';
import { Sector                                     } from '../../model/sector';
import { Beneficiaries                              } from '../../model/beneficiary';

import { ExportService                              } from './export.service';


@Injectable({
	providedIn: 'root'
})
export class DistributionService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private exportService: ExportService
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

    public export(option: string, extensionType: string, id: number) {
        if (option === 'project') {
          return this.exportService.export('distributions', id, extensionType);
        } else if (option === 'distribution') {
            return this.exportService.export('beneficiariesInDistribution', id, extensionType);
        }
    }

    public transaction(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/send';
        let body = '';
        return this.http.post(url, body);
    }

    public exportSample(sample: any, extensionType: string) {
        return this.exportService.export('distributionSample', true, extensionType, {sample: sample});

    }
}
