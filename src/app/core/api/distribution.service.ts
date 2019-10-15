import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language/language.service';
import { Distribution } from 'src/app/models/distribution';
import { SnackbarService } from '../logging/snackbar.service';
import { HttpService } from '../network/http.service';
import { NetworkService } from '../network/network.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { CustomModelService } from '../utils/custom-model.service';
import { ExportService } from './export.service';

@Injectable({
    providedIn: 'root'
})
export class DistributionService extends CustomModelService {
    customModelPath = 'distributions';

    distributionToDuplicate: Distribution;

    constructor(
        protected http: HttpService,
        protected exportService: ExportService,
        private snackbar: SnackbarService,
        public networkService: NetworkService,
        private _cacheService: AsyncacheService,
        private router: Router,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    public delete(distributionId) {
        const url = this.apiBase + '/distributions/' + distributionId + '/archive';
        return this.http.post(url, '');
    }

    public complete(distributionId) {
        const url = this.apiBase + '/distributions/' + distributionId + '/complete';
        return this.http.post(url, '');
    }

    public getOne(id: number) {
        const url = this.apiBase + '/distributions/' + id;
        return this.http.get(url);
    }

    public getByProject(idProject: number) {
        const url = this.apiBase + '/distributions/projects/' + idProject;
        return this.http.get(url);
    }

    public getQrVoucherByProject(idProject) {
        const url = this.apiBase + '/distributions-qr-voucher/projects/' + idProject;
        return this.http.get(url);
    }

    public getBeneficiaries(id: number) {
        const url = this.apiBase + '/distributions/' + id + '/beneficiaries';
        return this.http.get(url);
    }

    public getAssignableBeneficiaries(id: number) {
        const url = this.apiBase + '/distributions/' + id + '/assignable-beneficiaries';
        return this.http.get(url);
    }

    public setValidation(id: number) {
        const url = this.apiBase + '/distributions/' + id + '/validate';
        return this.http.post(url, {});
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
        const url = this.apiBase + '/transaction/distribution/' + id + '/pickup';
        return this.http.get(url);
    }
    public transaction(id: number, code: string) {
        const url = this.apiBase + '/transaction/distribution/' + id + '/send';
        const body = {
            code : code
        };
        return this.http.post(url, body);
    }

    public logs(id: number) {
        const url = this.apiBase + '/distributions/' + id + '/logs';
        return this.http.get(url);
    }

    public sendCode(id: number) {
        const url = this.apiBase + '/transaction/distribution/' + id + '/email';
        const body = {};
        return this.http.post(url, body);
    }

    public exportSample(sample: any, extensionType: string) {
        return this.exportService.export('distributionSample', true, extensionType, {sample: sample});
    }

    public checkProgression(id: number) {
        const url = this.apiBase + '/transaction/distribution/' + id + '/progression';
        return this.http.get(url);
    }

    public addNotes(generalReliefs: any[]) {
        const url  = `${this.apiBase}/distributions/generalrelief/notes`;
        const body = { generalReliefs };
        return this.http.post(url, body);
    }

    public distributeGeneralReliefs(ids: number[]) {
        const url = `${this.apiBase}/distributions/generalrelief/distributed`;
        const body = {
            ids: ids,
        };
        return this.http.post(url, body);
    }

    visit(id: string) {
        if (!this.networkService.getStatus()) {
            this._cacheService.get(AsyncacheService.DISTRIBUTIONS + '_' + id + '_beneficiaries')
                .subscribe(
                    result => {
                        if (!result) {
                            this.snackbar.error(this.language.cache_no_distribution);
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
