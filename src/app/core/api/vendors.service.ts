import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';
import { Vendors } from '../../model/vendors';
import { Location } from '../../model/location.new';
import { HttpService } from './http.service';
import { ExportService } from '../../core/api/export.service';
import { CustomModelService } from './custom-model.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { LocationService } from './location.service';
import { Vendor } from 'src/app/model/vendor.new';
import { User } from 'src/app/model/user.new';
import { AppInjector } from 'src/app/app-injector';

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
    ) {
        super(http);
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

    public print(vendor: Vendors) {
        return this._exportService.printInvoice(parseInt(vendor.id, 10));
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
