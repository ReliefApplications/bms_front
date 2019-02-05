import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { ExportService } from './export.service';

import { Households } from '../../model/households';
import { Project } from '../../model/project';
import { Location } from '../../model/location';
import { Sector } from '../../model/sector';
import { saveAs      } from 'file-saver/FileSaver';

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
    public get(filter: any, sort: any, pageIndex: number, pageSize: number) {
        const url = this.api + '/households/get/all';
        return this.http.post(url, {filter, sort, pageIndex, pageSize});
    }

    public getOne(beneficiaryId) {
        const url = this.api + '/households/' + beneficiaryId;
        return this.http.get(url);
    }

    /**
     * Get the csv template to import household
     */
    public getTemplate() {
        const url = this.api + '/csv/households/export';
        return this.http.get(url).toPromise()
        .then(response => {
            saveAs(response, 'households_template' + '.' + 'xls');
        });
    }

    /**
     * Get all households
     * @param newHouseholds any
     */
    public getImported(newHouseholds: any) {
        const url = this.api + '/households/get/imported';
        return this.http.post(url, {households: newHouseholds});
    }

    /**
     * Get all households
     */
    public getCachedHouseholds(email: string) {
        const url = this.api + '/households/get/cached?email=' + email;
        return this.http.get(url);
    }

    /**
     * Upload CSV  and data validation to import new household
     * @param body any
     * @param idProject number
     * @param step number
     * @param token string
     */
    public sendDataToValidation(email: string, body: any, idProject: number, step: number, token?: string) {
        let url;
        if (token) {
            url = this.api + '/import/households/project/' + idProject + '?step=' + step + '&token=' + token + "&email=" + email;
        } else {
            url = this.api + '/import/households/project/' + idProject + '?step=' + step + "&email=" + email;

        }

        return this.http.post(url, body);
    }

    /**
     * Add household.
     * @param hh
     * @param projects_ids
     */
    public add(hh: any, projects_ids: string[]) {
        const url = this.api + '/households'
        let body = {
            household: hh,
            projects: projects_ids
        }
        return this.http.put(url, body);
    }

    /**
     * Update household.
     * @param householdId
     * @param hh
     * @param projects_ids
     */
    public edit(householdId: number, hh: any, projects_ids: string[]) {
        const url = this.api + '/households/' + householdId;
        let body = {
            household: hh,
            projects: projects_ids
        }
        return this.http.post(url, body);
    }

    /**
     * Export beneficiaries
     * @param  extensionType type of file to export
     * @return               file
     */
    public export (extensionType: string) {
        return this.exportService.export('beneficiaries', true, extensionType);
    }

    /**
     * Export householdsTemplate
     * @param  extensionType type of file to export
     * @return               file
     */
    public exportTemplate (extensionType: string) {
        return this.exportService.export('householdsTemplate', true, extensionType);
    }

    public delete(householdId: number) {
        const url = this.api + '/households/' + householdId;
        return this.http.delete(url);
    }

    public testFileTemplate(file: any, location: any) {
        let params = {};
        params['type'] = 'xls';
        params['templateSyria'] = true;
        
        const options = {
            responseType: "blob",
            params: params
        };

        const url = this.api + '/import/households?adm=' + location.adm + '&name=' + location.name;
        return this.http.post(url, file, options).toPromise()
            .then((response) => {
                saveAs(response, 'templateSyria.xls');
            });
    }
}
