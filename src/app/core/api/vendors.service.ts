import { Injectable } from '@angular/core';
import { AppInjector } from 'src/app/app-injector';
import { LanguageService } from 'src/app/core/language/language.service';
import { User } from 'src/app/models/user';
import { Vendor } from 'src/app/models/vendor';
import { URL_BMS_API } from '../../../environments/environment';
import { ExportService } from '../../core/api/export.service';
import { Location } from '../../models/location';
import { AuthenticationService } from '../authentication/authentication.service';
import { HttpService } from '../network/http.service';
import { CustomModelService } from '../utils/custom-model.service';
import { LocationService } from './location.service';

@Injectable({
    providedIn: 'root'
})
export class VendorsService extends CustomModelService {
    readonly api = URL_BMS_API;

    constructor(
        protected http: HttpService,
        public _exportService: ExportService,
        private authenticationService: AuthenticationService,
        private locationService: LocationService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    public get() {
        const url = this.api + '/vendors';
        return this.http.get(url);
    }

    public getOne(id: number) {
        const url = this.apiBase + '/vendors/' + id;
        return this.http.get(url);
    }


    public create(body: any) {
        return this.authenticationService.createVendor(body);
    }

    public update(id: number, body: any) {
        const url = this.api + '/vendors/' + id;
        return this.authenticationService.updateUser(body, url);
    }

    public delete(id: number) {
        const url = this.api + '/vendors/' + id + '/archive';
        return this.http.post(url, {});
    }

    public print(vendor: Vendor) {
        return this._exportService.printInvoice(vendor.get('id')).subscribe();
    }

    // TO DO : make an empty method by default for every service
    public fillWithOptions(vendor: Vendor) {

        if (!vendor.get('user')) {
            vendor.set('user', new User());
        }
    }
}
