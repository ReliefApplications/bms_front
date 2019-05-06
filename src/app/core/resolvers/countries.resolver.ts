import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from 'src/app/model/country';
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
            const countries = this.userService.currentUser.get<Array<string>>('countries').map((country: string) => {
                return this.countriesService.stringToCountry(country);
            });
            this.countriesService.fillWithCountries(countries);
        }
    }
}