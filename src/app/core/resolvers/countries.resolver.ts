import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from 'src/app/models/country';
import { AppInjector } from '../../app-injector';
import { UserService } from '../api/user.service';
import { CountriesService } from '../countries/countries.service';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable({
    providedIn: 'root'
})
export class CountryResolver implements Resolve<Observable<Country> | Country> {

    private asyncCacheService = AppInjector.get(AsyncacheService);
    private countriesService = AppInjector.get(CountriesService);
    private userService = AppInjector.get(UserService);
    private router = AppInjector.get(Router);


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country> | Country {
        if (!this.userService.currentUser) {
            return this.countriesService.setCountry(undefined);
        }

        if (!this.countriesService.selectableCountries.value.length) {
            this.getCountries();
        }

        if (this.countriesService.selectedCountry.value) {
            return this.countriesService.selectedCountry.value;
        }

        return this.asyncCacheService.getCountry().pipe(
            map((country: Country) => {
                // Navigate to one-depth url if the url is more than one-depth
                if (route.url.length >= 2) {
                    this.router.navigate(route.url.slice(0, 1).map((urlSegment: UrlSegment) => {
                        return urlSegment.path;
                    }));
                }
                if (country !== undefined && this.countriesService.selectableCountries.value.includes(country)) {
                    return this.countriesService.setCountry(country);
                } else {
                    return this.countriesService.setCountry(this.countriesService.selectableCountries.value[0]);
                }

            })
        );

    }

    private getCountries() {
        if (this.userService.hasRights('ROLE_ACCESS_ALL_COUNTRIES')) {
            this.countriesService.fillWithAllExistingCountries();
        }
        else {
            this.countriesService.fillWithCountries(this.userService.currentUser.get<Array<Country>>('countries'));
        }
    }
}
