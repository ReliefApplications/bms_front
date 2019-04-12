import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { URL_BMS_API } from '../../../environments/environment';
import { ExportService } from './export.service';
import { HttpService } from './http.service';




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
     * Upload CSV  and data validation to import new household
     * @param body any
     * @param projectId number
     * @param step number
     * @param token string
     */
    public sendDataToValidation(email: string, body: any, projectId: number, token?: string) {
        const params = {
            token: token !== undefined ? token : '',
            email: email,
        } ;

        return this.http.post(`${this.api}/import/households/project/${projectId}`, body, {params});
    }

    /**
     * Add household.
     * @param hh
     * @param projects_ids
     */
    public add(hh: any, projects_ids: string[]) {
        const url = this.api + '/households';
        const body = {
            household: hh,
            projects: projects_ids
        };
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
        const body = {
            household: hh,
            projects: projects_ids
        };
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
        const params = {};
        params['type'] = 'xls';
        params['templateSyria'] = true;

        const options = {
            responseType: 'blob',
            params: params
        };

        const url = this.api + '/import/households?adm=' + location.adm + '&name=' + location.name;
        return this.http.post(url, file, options).toPromise()
            .then((response) => {
                saveAs(response, 'templateSyria.xls');
            });
    }
}
