import { Injectable                                 } from '@angular/core';
import { URL_BMS_API                                } from '../../../environments/environment';
import { HttpService                                } from './http.service';
import { DistributionData                           } from '../../model/distribution-data';
import { ExportService                              } from './export.service';


@Injectable({
    providedIn: 'root'
})
export class DistributionService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private exportService: ExportService,
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
        } else if (option === 'transaction') {
            return this.exportService.export('transaction', id, extensionType);
        }
    }
    public refreshPickup(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/pickup';
        return this.http.get(url);
    }
    public transaction(id: number, code: string) {
        const url = this.api + '/transaction/distribution/' + id + '/send';
        const body = {
            code : code
        };
        return this.http.post(url, body);
    }

    public logs(id: number) {
        const url = this.api + '/distributions/' + id + '/logs';
        return this.http.get(url);
    }

    public sendCode(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/email';
        const body = {};
        return this.http.post(url, body);
    }

    public exportSample(sample: any, extensionType: string) {
        return this.exportService.export('distributionSample', true, extensionType, {sample: sample});

    }

    public checkProgression(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/progression';
        return this.http.get(url);
    }

    public addNote(idTransaction: number, notes: string) {
        const url = `${this.api}/distributions/generalrelief/${idTransaction}`;
        return this.http.post(url, JSON.stringify({notes}));
    }

    public distributeGeneralReliefs(ids: number[]) {
        const url = `${this.api}/distributions/generalrelief/distributed`;
        const body = {
            ids: ids,
        };
        return this.http.post(url, JSON.stringify(body));
    }
}
