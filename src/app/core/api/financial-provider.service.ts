import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';
import { FinancialProvider } from './../../model/financial-provider';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';


@Injectable({
    providedIn: 'root'
})
export class FinancialProviderService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'financial/provider';

    constructor(protected http: HttpService) {
        super(http);
    }

    // public get() {
    //     const url = this.api + '/financial/provider';
    //     return this.http.get(url);
    // }

    public update(body) {
        const url = this.api + this.customModelPath;
        return this.http.post(url, { username: body['username'], password: body['password'] });
    }

    fillWithOptions(financialProvider: FinancialProvider) {

    }
}
