import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { LanguageService } from 'src/app/core/language/language.service';
import { Booklet } from 'src/app/models/booklet';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';

@Injectable({
    providedIn: 'root'
})
export class BookletService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'booklets';

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
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
        const url = this.api + `/booklets/assign/${idBeneficiary}/${idDistribution}`;
        return this.http.post(url, body);
    }

    public fillWithOptions(booklet: Booklet) {
    }
}
