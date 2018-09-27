import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { ExportService } from './export.service';

import { Households } from '../../model/households';
import { Project } from '../../model/project';
import { Location } from '../../model/location';
import { Sector } from '../../model/sector';


@Injectable({
    providedIn: 'root'
})
export class HouseholdsService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private exportService: ExportService
    ) {
    }

    /**
     * Get all households
     * @param body any
     */
    public get(body?: any) {
        const url = this.api + '/households/get/all';
        return this.http.post(url, body);
    }

    /**
     * Get the csv template to import household
     */
    public getTemplate() {
        const url = this.api + '/csv/households/export';
        return this.http.get(url);
    }

    /**
     * Upload CSV  and data validation to import new household
     * @param body any
     * @param idProject number
     * @param step number
     * @param token string
     */
    public sendDataToValidation(body: any, idProject: number, step: number, token?: string) {
        let url;
        if (token) {
            url = this.api + '/import/households/project/' + idProject + '?step=' + step + '&token=' + token;
        } else {
            url = this.api + '/import/households/project/' + idProject + '?step=' + step;

        }
        return this.http.post(url, body);
    }

    /**
     * To add an household
     * @param body
     * @param id_Project
     */
    public add(body: any, id_Project: string) {
        const url = this.api + '/households/project/' + id_Project;
        return this.http.put(url, body);
    }

    /**
     * Export beneficiaries
     * @param  extensionType type of file to export
     * @return               file
     */
    public export (extensionType: string) {
        return this.exportService.export('beneficiaries', true, extensionType);
    }

}
