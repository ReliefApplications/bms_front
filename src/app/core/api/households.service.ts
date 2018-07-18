import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';

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
        private http: HttpService
    ) {
    }

    /**
     * Get all households
     * @param body 
     */
    public get(body?: any) {
        let url = this.api + "/households/get/all";
        // return of(HOUSEHOLDS);
        return this.http.post(url, body);
    }

    /**
     * Get the csv template to import household
     */
    public getTemplate() {
        let url = this.api + "/csv/households/export";
        return this.http.get(url);
    }

    /**
     * Upload CSV to import new household
     * @param body 
     */
    public sendDataToValidation(body: any, idProject: number, step: number, token?: string) {
        let url;
        if (token) {
            url = this.api + "/import/households/project/" + idProject + "?step=" + step + "&token=" + token;
        }
        else {
            url = this.api + "/import/households/project/" + idProject + "?step=" + step;

        }
        return this.http.post(url, body);
    }

}

