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

    // projectService = AppInjector.get(ProjectService);
    // distributionService = AppInjector.get(DistributionService);
    // beneficiariesService = AppInjector.get(BeneficiariesService);
    // vendorsService = AppInjector.get(VendorsService);

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }


    public fillWithOptions(log: Log) {
        const appInjector = AppInjector;
        const url = log.fields.url.value;
        const request = log.fields.request.value;
        let idMatch = [];

        // We only request data from the backend when strictly necessary
        if (url.includes('import') || url.includes('transaction') || url.includes('archive') || url.includes('complete')
            || url.includes('validate') || url.includes('assign') || url.includes('remove') || url.includes('add')) {
            if (url.includes('assign') || url.includes('remove')) {
                // url = /booklets/assign/{benefId}/{distId}
                // url = /distributions/{distId}/beneficiaries/{benefId}/remove
                idMatch = url.match(/.*\/([0-9]+).*\/([0-9]+)/);
                forkJoin(
                    appInjector.get(DistributionService).getOne(idMatch[url.includes('assign') ? 2 : 1]),
                    appInjector.get(BeneficiariesService).getOne(idMatch[url.includes('assign') ? 1 : 2])
                ).subscribe(([distribution, beneficiary]: [any, any]) => {
                    if (distribution === null || beneficiary === null) {
                        log.set('details', this.language.log_not_exists + '\n'
                            + this.language.log_old_id + ': ' + idMatch[1]);
                    } else {
                        if (url.includes('assign')) {
                            log.set('details', this.language.log_distributions + ': ' + distribution.name + '\n'
                                + this.language.log_beneficiaries + ': ' + beneficiary.local_given_name + '\n'
                                + this.language.log_codes + ': ' + request.match(/.*"code":"(.*?)"/)[1]);
                        } else {
                            log.set('details', this.language.log_distributions + ': ' + distribution.name + '\n'
                                + this.language.log_beneficiaries + ': ' + beneficiary.local_given_name);
                        }
                    }
                });
            } else if (url.includes('distribution')) {
                // url = /transaction/distribution/{id}/send || /transaction/distribution/{id}/email || /distributions/{id}/validate
                // url = /import/beneficiaries/distributions/{id} || /distributions/archive/{id} || /distributions/complete/{id}
                idMatch = url.match(/.*\/([0-9]+)/);
                appInjector.get(DistributionService).getOne(idMatch[1]).subscribe((distribution: any) => {
                    if (distribution === null) {
                        log.set('details', this.language.log_not_exists + '\n'
                            + this.language.log_old_id + ': ' + idMatch[1]);
                    } else {
                        log.set('details', this.language.log_distributions + ': ' + distribution.name);
                    }
                });
            } else if (url.includes('project')) {
                // url = /import/households/project/{id} || api/import/households/project/{id} || /projects/{id}/beneficiaries/add
                idMatch = url.match(/.*\/([0-9]+)/);
                appInjector.get(ProjectService).getOne(idMatch[1]).subscribe((project: any) => {
                    if (project === null) {
                        log.set('details', this.language.log_not_exists + '\n'
                            + this.language.log_old_id + ': ' + idMatch[1]);
                    } else {
                        log.set('details', this.language.log_project + ': ' + project.name);
                    }
                });
            } else {
                // url = /vendors/archive/{id}
                idMatch = url.match(/.*\/([0-9]+)/);
                appInjector.get(VendorsService).getOne(idMatch[1]).subscribe((user: any) => {
                    if (user === null) {
                        log.set('details', this.language.log_not_exists + '\n'
                            + this.language.log_old_id + ': ' + idMatch[1]);
                    } else {
                        log.set('details', this.language.log_vendors + ': ' + user.name);
                    }
                });
            }
        }
    }

    // Solves the details issue, but at a high cost.
    // Fix options are: 1. Getting all the logs but treating only the ones from the tab (to reduce cost)
    // 2. Realise the problem with fillWithOptions() and solve it

    // public getDetails(log: Log) {
    //     const appInjector = AppInjector;
    //     const url = log.fields.url.value;
    //     const request = log.fields.request.value;
    //     let idMatch = [];

    //     // We only request data from the backend when strictly necessary
    //     if (url.includes('import') || url.includes('transaction') || url.includes('archive') || url.includes('complete')
    //         || url.includes('validate') || url.includes('assign') || url.includes('remove') || url.includes('add')) {
    //         if (url.includes('assign') || url.includes('remove')) {
    //             // url = /booklets/assign/{benefId}/{distId}
    //             // url = /distributions/{distId}/beneficiaries/{benefId}/remove
    //             idMatch = url.match(/.*\/([0-9]+).*\/([0-9]+)/);
    //             forkJoin(
    //                 appInjector.get(DistributionService).getOne(idMatch[url.includes('assign') ? 2 : 1]),
    //                 appInjector.get(BeneficiariesService).getOne(idMatch[url.includes('assign') ? 1 : 2])
    //             ).subscribe(([distribution, beneficiary]: [any, any]) => {
    //                 if (distribution === null || beneficiary === null) {
    //                     log.set('details', this.language.log_not_exists + '\n'
    //                         + this.language.log_old_id + ': ' + idMatch[1]);
    //                 } else {
    //                     if (url.includes('assign')) {
    //                         log.set('details', this.language.log_distributions + ': ' + distribution.name + '\n'
    //                             + this.language.log_beneficiaries + ': ' + beneficiary.local_given_name + '\n'
    //                             + this.language.log_codes + ': ' + request.match(/.*"code":"(.*?)"/)[1]);
    //                     } else {
    //                         log.set('details', this.language.log_distributions + ': ' + distribution.name + '\n'
    //                             + this.language.log_beneficiaries + ': ' + beneficiary.local_given_name);
    //                     }
    //                 }
    //             });
    //         } else if (url.includes('distribution')) {
    //             // url = /transaction/distribution/{id}/send || /transaction/distribution/{id}/email || /distributions/{id}/validate
    //             // url = /import/beneficiaries/distributions/{id} || /distributions/archive/{id} || /distributions/complete/{id}
    //             idMatch = url.match(/.*\/([0-9]+)/);
    //             appInjector.get(DistributionService).getOne(idMatch[1]).subscribe((distribution: any) => {
    //                 if (distribution === null) {
    //                     log.set('details', this.language.log_not_exists + '\n'
    //                         + this.language.log_old_id + ': ' + idMatch[1]);
    //                 } else {
    //                     log.set('details', this.language.log_distributions + ': ' + distribution.name);
    //                 }
    //             });
    //         } else if (url.includes('project')) {
    //             // url = /import/households/project/{id} || api/import/households/project/{id} || /projects/{id}/beneficiaries/add
    //             idMatch = url.match(/.*\/([0-9]+)/);
    //             appInjector.get(ProjectService).getOne(idMatch[1]).subscribe((project: any) => {
    //                 if (project === null) {
    //                     log.set('details', this.language.log_not_exists + '\n'
    //                         + this.language.log_old_id + ': ' + idMatch[1]);
    //                 } else {
    //                     log.set('details', this.language.log_project + ': ' + project.name);
    //                 }
    //             });
    //         } else {
    //             if (/.*\/import\/households/.test(url)) {
    //                 return;
    //             }
    //             console.log(url)
    //             // url = /vendors/archive/{id}
    //             idMatch = url.match(/.*\/([0-9]+)/);
    //             appInjector.get(VendorsService).getOne(idMatch[1]).subscribe((user: any) => {
    //                 if (user === null) {
    //                     log.set('details', this.language.log_not_exists + '\n'
    //                         + this.language.log_old_id + ': ' + idMatch[1]);
    //                 } else {
    //                     log.set('details', this.language.log_vendors + ': ' + user.name);
    //                 }
    //             });
    //         }
    //     }
    // }
}
