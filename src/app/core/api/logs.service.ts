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
import { SnackbarService } from '../logging/snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class LogsService extends CustomModelService {
    customModelPath = 'logs';
    readonly api = URL_BMS_API;

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
        private snackbar: SnackbarService,
    ) {
        super(http, languageService);
    }


    public fillWithOptions(log: Log) {

    }

    public getDetails(log: Log) {
        const appInjector = AppInjector;
        const url = log.fields.url.value;
        const request = log.fields.request.value;
        const status = log.fields.status.value;
        let idMatch = [];
        let requestMatch = [];
        let detailsString;
        let detailsRequest;

        // Only check the urls that need to fill the details
        const canFill = (url.includes('import') || url.includes('transaction') || url.includes('archive') || url.includes('complete')
            || url.includes('validate') || url.includes('assign') || url.includes('remove') || url.includes('add')
            || /.+\/distributions\/[0-9]+\/beneficiary/.test(url));

        if (canFill && status !== 'Not Found') {
            // Set up the switch
            let switchCase;
            if (url.includes('assign') || url.includes('remove')) {
                switchCase = 'distributionBeneficiaries';
            } else if (url.includes('distribution')) {
                switchCase = 'distributions';
            } else if (url.includes('project')) {
                switchCase = 'projects';
            } else if (url.includes('vendor')) {
                switchCase = 'vendors';
            } else {
                switchCase = 'error';
            }

            switch (switchCase) {

                case 'distributionBeneficiaries':
                {
                    idMatch = url.match(/.*\/([0-9]+).*\/([0-9]+)/);
                    forkJoin(
                        appInjector.get(DistributionService).getOne(idMatch[url.includes('assign') ? 2 : 1]),
                        appInjector.get(BeneficiariesService).getOne(idMatch[url.includes('assign') ? 1 : 2]))
                        .subscribe(([distribution, beneficiary]: [any, any]) => {
                            if (!distribution || !beneficiary) {
                                detailsString = this.language.log_not_exists + '\n'
                                    + this.language.log_old_id + ':\n ' + this.language.log_distributions + ': '
                                    + idMatch[url.includes('assign') ? 2 : 1] + '\n ' + this.language.log_beneficiaries + ': '
                                    + idMatch[url.includes('assign') ? 1 : 2];
                            } else {
                                if (url.includes('assign')) {
                                    detailsString = this.language.log_distributions + ': ' + distribution.name + '\n'
                                        + this.language.log_beneficiaries + ': ' + beneficiary.local_given_name + '\n'
                                        + this.language.log_codes + ': ' + request.match(/.*"code":"(.*?)"/)[1];
                                } else {
                                    detailsString = this.language.log_distributions + ': ' + distribution.name + '\n'
                                        + this.language.log_beneficiaries + ': ' + beneficiary.local_given_name;
                                }
                            }
                        log.set('details', detailsString);
                    });
                }
                break;

                case 'distributions':
                {
                    idMatch = url.match(/.*\/([0-9]+)/);
                    detailsRequest = appInjector.get(DistributionService).getOne(idMatch[1]).subscribe(
                        (distribution) => {
                            if (distribution) {
                                detailsString = this.language.log_distributions + ': '
                                    + distribution.name;

                                if (/.+\/distributions\/[0-9]+\/beneficiary/.test(url)) {
                                    requestMatch = request.match(/"local_given_name":".*?"/g);
                                    if (requestMatch) {
                                        for (let i = 0; i < requestMatch.length; i++) {
                                            detailsString += '\n' + this.language.log_beneficiary + ': ' + requestMatch[i]
                                                .substring(20, requestMatch[i].length - 1);
                                        }
                                    }
                                    else {
                                        detailsString += '\n' + this.language.log_beneficiary + ': ' + this.language.log_not_exists;
                                    }
                                }
                            } else {
                                detailsString = this.language.log_not_exists + '\n'
                                    + this.language.log_old_id + ': ' + idMatch[1];
                            }
                            log.set('details', detailsString);
                        },
                        (error: any) => {
                            detailsString = this.language.log_not_exists + '\n'
                                + this.language.log_old_id + ': ' + idMatch[1];
                            log.set('details', detailsString);
                        });
                }
                break;

                case 'projects':
                    {
                        idMatch = url.match(/.*\/([0-9]+)/);
                        detailsRequest = appInjector.get(ProjectService).getOne(idMatch[1]);
                        if (detailsRequest) {
                            detailsRequest.subscribe((project: any) => {
                                if (project) {
                                    detailsString = this.language.log_project + ': ' + project.name;
                                } else {
                                    detailsString = this.language.log_not_exists + '\n'
                                        + this.language.log_old_id + ': ' + idMatch[1];
                                }
                                log.set('details', detailsString);
                            },
                                (error: any) => {
                                    detailsString = this.language.log_not_exists + '\n'
                                        + this.language.log_old_id + ': ' + idMatch[1];
                                    log.set('details', detailsString);
                                });
                        }
                    }
                    break;

                case 'vendors':
                {
                    idMatch = url.match(/.*\/([0-9]+)/);
                    appInjector.get(VendorsService).getOne(idMatch[1]).subscribe((user: any) => {
                        if (user === null) {
                            detailsString = this.language.log_not_exists + '\n'
                                + this.language.log_old_id + ': ' + idMatch[1];
                        } else {
                            detailsString = this.language.log_vendors + ': ' + user.name;
                        }
                        log.set('details', detailsString);
                    });
                }
                break;
            }
        } else {
            return;
        }

    }
}
