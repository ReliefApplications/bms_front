import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { LanguageService } from 'src/app/core/language/language.service';
import { URL_BMS_API } from '../../../environments/environment';
import { FinancialProvider } from '../../models/financial-provider';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';


@Injectable({
    providedIn: 'root'
})
export class FinancialProviderService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'financial/provider';

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    // Not expecting an Id here, as there is only one financial provider.
    public update(_id: number, body: object) {
        if (body['password']) {
            body['password'] = CryptoJS.SHA1(body['password']).toString(CryptoJS.enc.Base64);
        }
        return this.http.post(this.makeUrl(), body);
    }
}
