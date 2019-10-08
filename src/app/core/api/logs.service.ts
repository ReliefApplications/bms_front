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
import { forkJoin } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LogsService extends CustomModelService {
    customModelPath = 'logs';
    readonly api = URL_BMS_API;

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService
    ) {
        super(http, languageService);
    }

    public fillWithOptions(log: Log) {}

    public getDetails(log: Log) {
        const url = log.fields.url.value;
        const request = log.fields.request.value;
        const status = log.fields.status.value;
        let service: any;

        // Only check the urls that need to fill the details from the backend
        const canFill = (url.includes('import') || url.includes('transaction') || url.includes('archive') || url.includes('complete')
            || url.includes('validate') || url.includes('assign') || url.includes('remove') || url.includes('add')
            || url.includes('beneficiary'));

        if (canFill && status !== 'Not Found') {
            // Set up the services
            const objectId = /(\w*)\/(\d+)/.exec(url);
            if (!objectId) {
                log.set('details', this.language.log_no_details);
                return;
            }
            objectId.shift();

            switch (true) {
                case url.includes('distribution') || url.includes('assign'):
                    service = AppInjector.get(DistributionService);
                    objectId[0] = 'distribution'; break;
                case url.includes('project'):
                    service = AppInjector.get(ProjectService);
                    objectId[0] = 'project'; break;
                case url.includes('vendor'):
                    service = AppInjector.get(VendorsService);
                    objectId[0] = 'vendor'; break;
            }

            let detailString = '';
            if (url.includes('remove') || url.includes('assign')) {
                const ids = /(\d+).+(\d+)/.exec(url);
                ids.shift();
                forkJoin(
                    service.getOne(Number(ids[0])),
                    AppInjector.get(BeneficiariesService).getOne(Number(ids[1]))
                ).subscribe(([distribution, beneficiary]: [any, any]) => {
                    if (distribution) {
                        detailString = this.language.log_distribution + ': ' + distribution.name;
                        if (beneficiary) {
                            detailString += '\n' + this.language.log_beneficiary + ': ' + beneficiary.local_given_name;
                        }
                        if (url.includes('assign')) {
                            detailString += '\n' + this.language.log_code + ': ' + /code":"(.+?)".+/.exec(request)[1];
                        }
                    } else {
                        detailString = this.language.log_old_id + ': ' + ids[0];
                    }
                    log.set('details', detailString);
                });
            } else {
                service.getOne(Number(objectId[1])).subscribe(
                    (object: any) => {
                        if (!object) {
                            detailString = this.language.log_old_id + ': ' + objectId[1];
                        } else {
                            detailString = this.language['log_' + objectId[0]] + ': ' + object.name;
                            if (url.includes('beneficiary')) {
                                const requestMatch = /"local_given_name":"(\w+)/g.exec(request);
                                requestMatch.shift();
                                if (requestMatch) {
                                    for (let i = 0; i < requestMatch.length; i++) {
                                        detailString += '\n' + this.language.log_beneficiary + ': ' + requestMatch[i];
                                    }
                                }
                            }
                        }
                        log.set('details', detailString);
                    });
            }
        }
    }
}
