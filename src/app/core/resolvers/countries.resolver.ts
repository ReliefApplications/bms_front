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
        if (!this.countriesService.enabledCountries && this.userService.currentUser) {

            // this.fillWithCountries(this.userService.currentUser);
        }
        if (this.countriesService.enabledCountries) {
            return this.countriesService.currentCountry;
        }
        return this.asyncCacheService.getCountry().pipe(
            map((country: Country) => {
                if (country) {
                    return country;
                }
                return this.countriesService.enabledCountries[0];
            })
        );
    }

    // private fillWithCountries(user: User): Array<Country> {
    //     if (this.userService.hasRights('ROLE_ACCESS_ALL_COUNTRIES')) {
    //         return this.countriesService.fillWithAllExistingCountries();
    //     }
    //     return this.countriesService.fillWithCountries(this.userService.currentUser.get('countries'));
    // }
}
