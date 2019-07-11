import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_BMS_API } from 'src/environments/environment';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class CountryInterceptor implements HttpInterceptor {

    constructor(
        private countriesService: CountriesService,
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        if (req.url.match(URL_BMS_API) && this.countriesService.selectedCountry) {
            return next.handle(
                req.clone({
                    headers: req.headers.append('country', this.countriesService.selectedCountry.get<string>('id')),
                })
            );
        }
        return next.handle(req);
    }
}
