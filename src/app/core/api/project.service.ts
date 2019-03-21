import { Injectable } from '@angular/core';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { CustomModelService } from './custom-model.service';
import { AppInjector } from '../../app-injector';
import { forkJoin } from 'rxjs';
import { DonorService } from './donor.service';
import { SectorService } from 'src/app/core/api/sector.service';
import { Project } from 'src/app/model/project.new';
import { Donor } from 'src/app/model/donor.new';
import { Sector } from 'src/app/model/sector.new';

@Injectable({
    providedIn: 'root'
})
export class ProjectService extends CustomModelService {

    customModelPath = 'projects';

    constructor(protected http: HttpService) {
        super(http);
    }

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

    // Todo: add fail condition
    public fillWithOptions (project: Project) {
        const appInjector = AppInjector;
        forkJoin(
            appInjector.get(DonorService).get(),
            appInjector.get(SectorService).get()
        ).subscribe(([donorsOptions, sectorsOptions]: [any, any]) => {

            donorsOptions = donorsOptions.map(donor => {
                return Donor.apiToModel(donor);
            });
            sectorsOptions = sectorsOptions.map(sector => {
                return Sector.apiToModel(sector);
            });

            project.fields.donors.options = donorsOptions;
            project.fields.sectors.options = sectorsOptions;
        });
    }
}
