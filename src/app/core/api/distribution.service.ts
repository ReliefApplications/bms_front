import { Injectable                                 } from '@angular/core';
import { URL_BMS_API                                } from '../../../environments/environment';
import { HttpService                                } from './http.service';
import { DistributionData                           } from '../../model/distribution-data';
import { ExportService                              } from './export.service';
import { CustomModelService } from './custom-model.service';
import { Distribution } from 'src/app/model/distribution.new';
import { AppInjector } from 'src/app/app-injector';
import { LocationService } from './location.service';
import { Location } from 'src/app/model/location.new';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { SnackbarService } from '../logging/snackbar.service';
import { Router } from '@angular/router';
import { AsyncacheService } from '../storage/asyncache.service';
import { NetworkService } from './network.service';

@Injectable({
    providedIn: 'root'
})
export class DistributionService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'distributions';


    constructor(
        protected http: HttpService,
        protected exportService: ExportService,
        private snackbar: SnackbarService,
        public networkService: NetworkService,
        private _cacheService: AsyncacheService,
        private router: Router,
    ) {
        super(http);
    }

    public delete(distributionId) {
        const url = this.api + '/distributions/archive/' + distributionId;
        return this.http.post(url, '');
    }

    public getOne(id: number) {
        const url = this.api + '/distributions/' + id;
        return this.http.get(url);
    }

    public getByProject(idProject) {
        const url = this.api + '/distributions/projects/' + idProject;
        return this.http.get(url);
    }

    public getBeneficiaries(id: number) {
        const url = this.api + '/distributions/' + id + '/beneficiaries';
        return this.http.get(url);
    }

    public getAssignableBeneficiaries(id: number) {
        const url = this.api + '/distributions/' + id + '/assignable-beneficiaries';
        return this.http.get(url);
    }

    public setValidation(id: number) {
        const url = this.api + '/distributions/' + id + '/validate';
        return this.http.get(url);
    }

    public export(option: string, extensionType: string, id: number) {
        if (option === 'project') {
          return this.exportService.export('distributions', id, extensionType);
        } else if (option === 'distribution') {
            return this.exportService.export('beneficiariesInDistribution', id, extensionType);
        } else {
            return this.exportService.export(option, id, extensionType);
        }
    }
    public refreshPickup(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/pickup';
        return this.http.get(url);
    }
    public transaction(id: number, code: string) {
        const url = this.api + '/transaction/distribution/' + id + '/send';
        const body = {
            code : code
        };
        return this.http.post(url, body);
    }

    public logs(id: number) {
        const url = this.api + '/distributions/' + id + '/logs';
        return this.http.get(url);
    }

    public sendCode(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/email';
        const body = {};
        return this.http.post(url, body);
    }

    public exportSample(sample: any, extensionType: string) {
        return this.exportService.export('distributionSample', true, extensionType, {sample: sample});

    }

    public checkProgression(id: number) {
        const url = this.api + '/transaction/distribution/' + id + '/progression';
        return this.http.get(url);
    }

    public addNotes(generalReliefs: {id: number, notes: string}[]) {
        const url  = `${this.api}/distributions/generalrelief/notes`;
        const body = { generalReliefs };
        return this.http.post(url, body);
    }

    public distributeGeneralReliefs(ids: number[]) {
        const url = `${this.api}/distributions/generalrelief/distributed`;
        const body = {
            ids: ids,
        };
        return this.http.post(url, body);
    }

    public fillWithOptions(distribution: Distribution, locationType: string) {
    }

    fillAdm1Options(distribution: Distribution) {
        const appInjector = AppInjector;
        const location = distribution.fields.location.value;

        appInjector.get(LocationService).getAdm1()
            .subscribe((options) => {
                const adm1Options = options.map(adm1 => {
                    return { fields : {
                        name: { value: adm1.name },
                        id: { value: adm1.id }
                    }};
                });
                location.fields.adm1.options = adm1Options;
                location.fields.adm2.options = [];
                location.fields.adm3.options = [];
                location.fields.adm4.options = [];
                distribution.fields.location.value = location;
            });
    }

    fillAdm2Options(distribution: Distribution, adm1Id: Number) {
        const body = {
            adm1: adm1Id
        };
        const appInjector = AppInjector;
        const location = distribution.fields.location.value;

        appInjector.get(LocationService).getAdm2(body)
            .subscribe((options) => {
                const adm2Options = options.map(adm2 => {
                    return { fields : {
                        name: { value: adm2.name },
                        id: { value: adm2.id }
                    }};
                });
                location.fields.adm2.options = adm2Options;
                location.fields.adm3.options = [];
                location.fields.adm4.options = [];
                distribution.fields.location.value = location;
            });
    }

    fillAdm3Options(distribution: Distribution, adm2Id: Number) {
        const body = {
            adm2: adm2Id
        };
        const appInjector = AppInjector;
        const location = distribution.fields.location.value;

        appInjector.get(LocationService).getAdm3(body)
            .subscribe((options) => {
                const adm3Options = options.map(adm3 => {
                    return { fields : {
                        name: { value: adm3.name },
                        id: { value: adm3.id }
                    }};
                });
                location.fields.adm3.options = adm3Options;
                location.fields.adm4.options = [];
                distribution.fields.location.value = location;
            });
    }

    fillAdm4Options(distribution: Distribution, adm3Id: Number) {
        const body = {
            adm3: adm3Id
        };
        const appInjector = AppInjector;
        const location = distribution.fields.location.value;

        appInjector.get(LocationService).getAdm4(body)
            .subscribe((options) => {
                const adm4Options = options.map(adm4 => {
                    return { fields : {
                        name: { value: adm4.name },
                        id: { value: adm4.id }
                    }};
                });
                location.fields.adm4.options = adm4Options;
                distribution.fields.location.value = location;
            });
    }

    visit(id) {
        if (!this.networkService.getStatus()) {
            this._cacheService.get(AsyncacheService.DISTRIBUTIONS + '_' + id + '_beneficiaries')
                .subscribe(
                    result => {
                        if (!result) {
                            this.snackbar.error(this.texts.cache_no_distribution);
                        } else {
                            this.router.navigate(['/projects/distributions/' + id]);
                        }
                    }
                );
        } else {
            this.router.navigate(['/projects/distributions/' + id]);
        }
    }
}
