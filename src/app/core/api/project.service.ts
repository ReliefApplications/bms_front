import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SectorService } from 'src/app/core/api/sector.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { Donor } from 'src/app/models/donor';
import { Project } from 'src/app/models/project';
import { Sector } from 'src/app/models/sector';
import { AppInjector } from '../../app-injector';
import { CustomModelService } from '../utils/custom-model.service';
import { DonorService } from './donor.service';
import { HttpService } from '../network/http.service';



@Injectable({
    providedIn: 'root'
})
export class ProjectService extends CustomModelService {

    customModelPath = 'projects';

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }


    public addBeneficiaries(projectId: number, checkedElements: any) {
        const url =  `${this.apiBase}/projects/${projectId}/beneficiaries/add`;
        const body = {
            beneficiaries: checkedElements
        };
        return this.http.post(url, body);
    }

    public getOne(id: number) {
        const url = this.apiBase + '/projects/' + id;
        return this.http.get(url);
    }


    // Todo: add fail condition
    public fillWithOptions (project: Project) {
        const appInjector = AppInjector;
        forkJoin(
            appInjector.get(DonorService).get(),
            appInjector.get(SectorService).get()
        ).subscribe(([donorsOptions, sectorsOptions]: [any, any]) => {

            if (donorsOptions) {
                donorsOptions = donorsOptions.map(donor => {
                    return Donor.apiToModel(donor);
                });
                project.setOptions('donors', donorsOptions);
            }

            if (sectorsOptions) {
                sectorsOptions = sectorsOptions.map(sector => {
                    return Sector.apiToModel(sector);
                });
                project.setOptions('sectors', sectorsOptions);
            }
        });
    }
}
