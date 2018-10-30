import { Injectable } from '@angular/core';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
    ) {
    }
    public get() {
        let url = this.api + "/projects";
        return this.http.get(url);
    }

    public update(id: number, body: any) {
        let url = this.api + "/projects/" + id;
        return this.http.post(url, body);
    }

    public create(id: number, body: any) {
        let url = this.api + "/projects";
        return this.http.put(url, body);
    }

    public delete(id: number, body: any) {
        let url = this.api + "/projects/" + id;
        return this.http.delete(url, body);
    }

    public addBeneficiaries(projectId: number, filter: any) {
        let url = this.api + "/projects/" + projectId + "/beneficiaries/add";
        let body = {
            filter: filter
        }
        return this.http.post(url, body);
    }

    public getDates(projectId: number) {
        let url = this.api + "/projects/" + projectId + "/dates";
        return this.http.get(url);
    }
}
