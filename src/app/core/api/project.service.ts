import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SectorService } from 'src/app/core/api/sector.service';
import { Donor } from 'src/app/model/donor.new';
import { Project } from 'src/app/model/project.new';
import { Sector } from 'src/app/model/sector.new';
import { AppInjector } from '../../app-injector';
import { CustomModelService } from './custom-model.service';
import { DonorService } from './donor.service';
import { HttpService } from './http.service';



@Injectable({
    providedIn: 'root'
})
export class ProjectService extends CustomModelService {

    customModelPath = 'projects';

    constructor(protected http: HttpService) {
        super(http);
    }


    public addBeneficiaries(projectId: number, checkedElements: any) {
        const url =  '/projects/' + projectId + '/beneficiaries/add';
        const body = {
            beneficiaries: checkedElements
        };
        return this.http.post(url, body);
    }

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

            project.setOptions('donors', donorsOptions);
            project.setOptions('sectors', sectorsOptions);
        });
    }
}
