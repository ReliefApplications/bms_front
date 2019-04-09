import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { map } from 'rxjs/operators';
import { Adm } from 'src/app/model/location.new';


@Injectable({
    providedIn: 'root'
})
export class LocationService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService
    ) {
    }

    /**
     * Get all adm1
     */
    public getAdm1() {
        const url = this.api + '/location/adm1';
        return this.http.get(url);
    }

    /**
     * Get all adm2 associate to the selected adm1
     * @param body
     */
    public getAdm2(body?: any) {
        const url = this.api + '/location/adm2';
        return this.http.post(url, body);
    }

    /**
     * Get all adm3 associate to the selected adm2
     * @param body
     */
    public getAdm3(body?: any) {
        const url = this.api + '/location/adm3';
        return this.http.post(url, body);
    }

    /**
     * Get all adm4 associate to the selected adm3
     * @param body
     */
    public getAdm4(body?: any) {
        const url = this.api + '/location/adm4';
        return this.http.post(url, body);
    }

    /**
     * Get the codes of the upcoming distributions
     */
    public getUpcomingDistributionCode() {
        const url = this.api + '/location/upcoming_distribution';
        return this.http.get(url);
    }

    fillAdm1Options(object: CustomModel) {
        const location = object.fields.location.value;

        return this.getAdm1()
            .pipe(
                map((options) => {
                const adm1Options = options.map(adm1 => new Adm(adm1.id, adm1.name));
                location.fields.adm1.options = adm1Options;
                location.fields.adm2.options = [];
                location.fields.adm3.options = [];
                location.fields.adm4.options = [];
                object.fields.location.value = location;
            }));
    }

    fillAdm2Options(object: CustomModel, adm1Id: Number) {
        const body = {
            adm1: adm1Id
        };
        const location = object.fields.location.value;

        return this.getAdm2(body)
            .pipe(
                map((options) => {
                const adm2Options = options.map(adm2 => new Adm(adm2.id, adm2.name));
                location.fields.adm2.options = adm2Options;
                location.fields.adm3.options = [];
                location.fields.adm4.options = [];
                object.fields.location.value = location;
            }));
    }

    fillAdm3Options(object: CustomModel, adm2Id: Number) {
        const body = {
            adm2: adm2Id
        };
        const location = object.fields.location.value;

        return this.getAdm3(body)
            .pipe(
                map((options) => {
                    const adm3Options = options.map(adm3 => new Adm(adm3.id, adm3.name));
                    location.fields.adm3.options = adm3Options;
                    location.fields.adm4.options = [];
                    object.fields.location.value = location;
                }));
    }

    fillAdm4Options(object: CustomModel, adm3Id: Number) {
        const body = {
            adm3: adm3Id
        };
        const location = object.fields.location.value;

        return this.getAdm4(body)
            .pipe(
                map((options) => {
                    const adm4Options = options.map(adm4 => new Adm(adm4.id, adm4.name));
                    location.fields.adm4.options = adm4Options;
                    object.fields.location.value = location;
                }));
    }
}
