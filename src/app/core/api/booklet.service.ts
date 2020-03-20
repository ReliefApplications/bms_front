import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { LanguageService } from 'src/app/core/language/language.service';
import { Booklet, BookletStatus, Currency } from 'src/app/models/booklet';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';
import { BookletFilters } from 'src/app/models/data-sources/booklets-data-source';
import { ExportService } from './export.service';
import { AppInjector } from 'src/app/app-injector';
import { CURRENCIES } from 'src/app/models/constants/currencies';
import { DistributionService } from './distribution.service';
import { Distribution } from 'src/app/models/distribution';

@Injectable({
    providedIn: 'root'
})
export class BookletService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'booklets';

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
        private exportService: ExportService,
    ) {
        super(http, languageService);
    }
    public setPassword(code: string, password: string) {
        const body = {
            password: password ? CryptoJS.SHA1(password).toString(CryptoJS.enc.Base64) : null,
            code: code,
        };
        const url = this.api + `/booklets/update/password`;
        return this.http.post(url, body);
    }

    public assignBenef(code: string, idBeneficiary: number, idDistribution) {
        const body = {
            code: code,
        };
        const url = this.api + `/booklets/assign/${idDistribution}/${idBeneficiary}`;
        return this.http.post(url, body);
    }

    /**
     * Get all booklets page by page
     * @param body any
     */
    public get(filter: any, sort: any, pageIndex: number, pageSize: number) {
        const url = this.api + '/booklets/get/all';
        return this.http.post(url, {filter, sort, pageIndex, pageSize});
    }

     /**
     * Get all booklets page by page
     * @param body any
     */
    public getAll() {
        const url = this.api + '/booklets';
        return this.http.get(url);
    }

    public getInsertedBooklets(lastId: number) {
        const url = this.api + '/booklets/inserted/' + lastId;
        return this.http.get(url);
    }

    public fillWithOptions(booklet: Booklet) {
    }

    /**
     * Export booklet codes
     * @param  extensionType type of file to export
     * @return               file
     */
    public export (extensionType: string, filters: any = null, ids: Array<string> = []) {
        return this.exportService.export('bookletCodes', true, extensionType, {}, filters, ids);
    }

    public fillFiltersWithOptions(filters: BookletFilters) {
        const appInjector = AppInjector;

        // Get distributions
        appInjector.get(DistributionService).get().subscribe(
            (distributions: any) => {
                if (distributions) {
                    const distributionOptions  = distributions.map(distribution => {
                        return Distribution.apiToModel(distribution);
                    });
                    filters.setOptions('distribution', distributionOptions);
                }
        });

        // Get currency
        const currencyOptions = CURRENCIES.map(currency => new Currency(currency.name, currency.name));
        filters.setOptions('currency', currencyOptions);

        // Get status
        const statusOptions = [
            new BookletStatus('0', this.language.booklet_unassigned),
            new BookletStatus('1', this.language.distributed),
            new BookletStatus('2', this.language.booklet_used),
            new BookletStatus('3', this.language.booklet_deactivated),
        ];
        filters.setOptions('status', statusOptions);
    }
}
