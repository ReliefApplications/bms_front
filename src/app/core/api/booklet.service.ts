import { Injectable                                 } from '@angular/core';
import { URL_BMS_API                                } from '../../../environments/environment';
import { HttpService                                } from './http.service';
import { ExportService                              } from './export.service';
import * as CryptoJS from 'crypto-js';
import { finalize } from 'rxjs/operators';
import { Currency, Booklet } from 'src/app/model/booklet.new';
import { CustomModelService } from './custom-model.service';

@Injectable({
    providedIn: 'root'
})
export class BookletService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'booklets';

    constructor(
        protected http: HttpService,
        private exportService: ExportService,
    ) {
        super(http);
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
