import { Injectable } from '@angular/core';
import { CustomModelService } from '../utils/custom-model.service';
import { LanguageService } from '../language/language.service';
import { HttpService } from '../network/http.service';
import { Log } from 'src/app/models/log';
import { URL_BMS_API } from '../../../environments/environment';
import { AppInjector } from 'src/app/app-injector';
import { ProjectService } from './project.service';
import { DistributionService } from './distribution.service';
import { BeneficiariesService } from './beneficiaries.service';
import { VendorsService } from './vendors.service';
import { UserService } from './user.service';
import { Distribution } from 'src/app/models/distribution';
import { Project } from 'src/app/models/project';

@Injectable({
    providedIn: 'root'
})
export class LogsService extends CustomModelService {
    customModelPath = 'logs';
    readonly api = URL_BMS_API;

    projectService = AppInjector.get(ProjectService);
    distributionService = AppInjector.get(DistributionService);
    beneficiariesService = AppInjector.get(BeneficiariesService);
    vendorsService = AppInjector.get(VendorsService);
    userService = AppInjector.get(UserService);

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }


    public fillWithOptions (log: Log) {
        const appInjector = AppInjector;
        const url = log.get('url');
        const urlMatch = [];

        appInjector.get(ProjectService).get().subscribe((projects: any) => {
            if (projects) {
                const projectOptions = projects.map(project => {
                    return Project.apiToModel(project).get('name');
                });
                log.set('details', projectOptions);
            }
        });
    }
}
