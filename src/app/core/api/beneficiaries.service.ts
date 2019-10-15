import { Injectable } from '@angular/core';
import { Project } from 'src/app/models/project';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';
import { LanguageService } from '../language/language.service';

@Injectable({
    providedIn: 'root'
})
export class BeneficiariesService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'beneficiaries';

    constructor(protected http: HttpService, protected languageService: LanguageService) {
        super(http, languageService);
    }

    public get(distributionId) {
        const url = this.api + '/distributions/' + distributionId + '/beneficiaries';
        return this.http.get(url);
    }

    public getOne(id: number) {
        const url = this.apiBase + '/beneficiaries/' + id;
        return this.http.get(url);
    }

    public update(beneficiaryId: number, beneficiary: any) {
        const url = this.api + '/beneficiaries/' + beneficiaryId;
        return this.http.post(url, beneficiary);
    }

    public delete(beneficiaryId: number, distributionId: any, justification: string) {
        const url = this.api + '/distributions/' + distributionId + '/beneficiaries/' + beneficiaryId + '/remove';
        const body = {
            justification: justification
        };
        return this.http.post(url, body);
    }

    public getRandom(distributionId, size: number) {
        const url = this.api + '/distributions/' + distributionId + '/random' + '?size=' + size;
        return this.http.get(url);
    }

    public add(distributionId: number, beneficiaries: any[], justification: string) {
        const url = this.api + '/distributions/' + distributionId + '/beneficiary';
        const body = {
            beneficiaries: beneficiaries,
            justification: justification,
        };
        return this.http.put(url, body);
    }

    public getAllFromProject(projectId: number, target: string) {
        const body = { target: target };

        const url = this.api + '/distributions/beneficiaries/project/' + projectId;
        return this.http.post(url, body);
    }

    public import(distributionId: number, file: any, step: number) {
        const url = this.api + '/import/beneficiaries/distributions/' + distributionId + '?step=' + step;
        // step = 1 -> get the comparing tables & step = 2 -> update database.
        return this.http.post(url, file);
    }

    public listApi() {
        const url = this.api + '/import/api/households/list';
        return this.http.get(url);
    }

    public importApi(apiObject: any, project: Project) {
        const url = this.api + '/import/api/households/project/' + project.get('id');
        return this.http.post(url, apiObject);
    }
}
