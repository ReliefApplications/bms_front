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
import { forkJoin } from 'rxjs';

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


    public fillWithOptions(log: Log) {
        const url = log.fields.url.value;
        let urlMatch = [];
        let detailString = '';
        // We only request data from the backend when strictly necessary
        if (url.includes('import') || url.includes('transaction') || url.includes('archive') || url.includes('complete')
            || url.includes('validate') || url.includes('assign') || url.includes('remove') || url.includes('add')) {
            if (url.includes('assign') || url.includes('remove')) {
                // url = /booklets/assign/{benefId}/{distId}
                // url = /distributions/1/beneficiaries/3/remove
                urlMatch = url.match(/.*\/([0-9]+).*\/([0-9]+)/);
                forkJoin(
                    this.distributionService.getOne(urlMatch[url.includes('assign') ? 2 : 1]),
                    this.beneficiariesService.getOne(urlMatch[url.includes('assign') ? 1 : 2])
                ).subscribe(([distribution, beneficiary]: [any, any]) => {
                    detailString = 'Distribution: ' + distribution.name + ', Beneficiary: ' + beneficiary.name;
                    log.set('details', detailString);
                });
            } else if (url.includes('distribution')) {
                // url = /transaction/distribution/1/send || /transaction/distribution/1/email || /distributions/1/validate
                // url = /import/beneficiaries/distributions/1 || /distributions/archive/1 || /distributions/complete/1
                urlMatch = url.match(/.*\/([0-9]+)/);
                this.distributionService.getOne(urlMatch[1]).subscribe((distribution: any) => {
                    log.set('details', 'Distribution: ' + distribution.name);
                });
            } else if (url.includes('poject')) {
                // url = /import/households/project/2 || api/import/households/project/2 || /projects/2/beneficiaries/add
                urlMatch = url.match(/.*\/([0-9]+)/);
                this.projectService.getOne(urlMatch[1]).subscribe((project: any) => {
                    log.set('details', 'Project: ' + project.name);
                });
            } else {
                // url = /vendors/archive/4
                urlMatch = url.match(/.*\/([0-9]+)/);
                this.vendorsService.getOne(urlMatch[1]).subscribe((user: any) => {
                    log.set('details', 'Vendor: ' + user.name);
                });
            }
        }
    }
}
