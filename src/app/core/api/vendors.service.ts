import { Injectable } from '@angular/core';
import { AppInjector } from 'src/app/app-injector';
import { User } from 'src/app/model/user';
import { Vendor } from 'src/app/model/vendor';
import { LanguageService } from 'src/texts/language.service';
import { URL_BMS_API } from '../../../environments/environment';
import { ExportService } from '../../core/api/export.service';
import { Location } from '../../model/location';
import { AuthenticationService } from '../authentication/authentication.service';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';
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

    public create(body: any) {
        return this.authenticationService.createVendor(body);
    }

    public update(id: number, body: any) {
        const url = this.api + '/vendors/' + id;
        return this.http.post(url, body);
    }

    public delete(id: number) {
        const url = this.api + '/vendors/' + id + '/archive';
        return this.http.post(url, {});
    }

    public print(vendor: Vendor) {
        return this._exportService.printInvoice(vendor.get('id'));
    }

    // TO DO : make an empty method by default for every service
    public fillWithOptions(vendor: Vendor) {
        const appInjector = AppInjector;
        if (!vendor.get('location')) {
            vendor.set('location', new Location());
        }
        appInjector.get(LocationService).fillAdm1Options(vendor).subscribe();

        if (!vendor.get('user')) {
            vendor.set('user', new User());
        }
    }
}
