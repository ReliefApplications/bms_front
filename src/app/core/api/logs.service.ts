import { Injectable } from '@angular/core';
import { CustomModelService } from '../utils/custom-model.service';
import { LanguageService } from '../language/language.service';
import { HttpService } from '../network/http.service';
import { Log } from 'src/app/models/log';
import { AppInjector } from 'src/app/app-injector';
import { ProjectService } from './project.service';
import { DistributionService } from './distribution.service';
import { BeneficiariesService } from './beneficiaries.service';
import { VendorsService } from './vendors.service';
import { of, zip, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LogsService extends CustomModelService {
    customModelPath = 'logs';
    // Subscriptions
    subscriptions: Array<Subscription>;

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService
    ) {
        super(http, languageService);
    }

    public getDetails(log: Log) {
        const url = log.fields.url.value;
        const request = log.fields.request.value;
        const status = log.fields.status.value;
        let service: any;

        // Only check the urls that need to fill the details from the backend
        const canFill = /\/\w+\/\d+\/\w+|\d+.+\d+|\/import\/.+\d+/g.test(url);
        if (canFill && status !== 'Not Found') {
            // Set up the services
            const objectId = /(\w+)\/(\d+)/.exec(url);
            if (!objectId) {
                log.set('details', this.language.log_no_details);
                return;
            }
            objectId.shift();

            switch (true) {
                case url.includes('distribution') || url.includes('assign'):
                    service = AppInjector.get(DistributionService);
                    objectId[0] = 'distribution';
                    break;
                case url.includes('project'):
                    service = AppInjector.get(ProjectService);
                    objectId[0] = 'project';
                    break;
                case url.includes('vendor'):
                    service = AppInjector.get(VendorsService);
                    objectId[0] = 'vendor';
                    break;
            }

            const details = this.getDataFromService(objectId[0], Number(objectId[1]), service);
            let beneficiaryDetails = of('');
            const ids = /(\d+).+(\d+)/.exec(url);
            if (ids) {
                ids.shift();
                beneficiaryDetails = this.getDataFromService('beneficiary', Number(objectId[1]), AppInjector.get(BeneficiariesService));
            }
            zip(details, beneficiaryDetails, (d1, d2) => d1 + '\n' + d2).subscribe(detailString => {
                if (url.includes('beneficiary')) {
                    detailString += this.setBeneficiaries(request);
                }
                if (url.includes('assign')) {
                    detailString += '\n' + this.language.log_code + ': ' + request.match(/"code":"(.+?)"/)[1];
                }
                log.set('details', detailString);
            });
        }
    }

    private getDataFromService(objectName: string, id: Number, service: any) {
        let detailString;
        return service.getOne(id).pipe(
            map(res => {
                if (!res) {
                    detailString = this.language['log_' + objectName] + ' ' + this.language.log_old_id + ': ' + id;
                } else {
                    const name = (objectName === 'beneficiary') ? 'local_given_name' : 'name';
                    detailString = this.language['log_' + objectName] + ': ' + res[name];
                }
                return detailString;
            }));
    }

    private setBeneficiaries(request: string): string {
        let beneficiaries = '';
        const requestMatch = request.match(/(?<=local_given_name":")\w+/g);
        if (requestMatch) {
            for (let i = 0; i < requestMatch.length; i++) {
                beneficiaries += this.language.log_beneficiary + ': ' + requestMatch[i] + '\n';
            }
        }
        return beneficiaries;
    }
}
