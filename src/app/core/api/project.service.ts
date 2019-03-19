import { Injectable } from '@angular/core';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { CustomModelService } from './custom-model.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectService extends CustomModelService {

    customModelPath = 'projects';

    constructor(protected http: HttpService) {
        super(http);
    }

    // public get() {
    //     const url = this.api + '/projects';
    //     return this.http.get(url);
    // }

    // public update(id: number, body: any) {
    //     const url = this.api + '/projects/' + id;
    //     return this.http.post(url, body);
    // }

    // public create(id: number, body: any) {
    //     const url = this.api + '/projects';
    //     return this.http.put(url, body);
    // }

    // public delete(id: number, body: any) {
    //     const url = this.api + '/projects/' + id;
    //     return this.http.delete(url, body);
    // }

    public addBeneficiaries(projectId: number, checkedElements: any) {
        const url =  '/projects/' + projectId + '/beneficiaries/add';
        const body = {
            beneficiaries: checkedElements
        };
        return this.http.post(url, body);
    }

    // public getDates(projectId: number) {
    //     const url = this.api + '/projects/' + projectId + '/dates';
    //     return this.http.get(url);
    // }
}
