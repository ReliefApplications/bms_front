import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { concat, forkJoin, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Country } from 'src/app/models/country';
import { Project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { AuthenticationService } from '../authentication/authentication.service';
import { CountriesService } from '../countries/countries.service';
import { Language } from '../language/language';
import { LanguageService } from '../language/language.service';
import { SnackbarService } from '../logging/snackbar.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { CachedCountryReturnValue } from '../storage/cached-country-value.interface';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {


    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    private redirectUrl = '';
    private code: number;
    private user: any;

    constructor (
        private authService: AuthenticationService,
        private userService: UserService,
        private router: Router,
        private snackbar: SnackbarService,
        private languageService: LanguageService,
        private countriesService: CountriesService,
        private asyncacheService: AsyncacheService,
        ) {}

    // Login from the login page
    public login(username: string, password: string) {
        this.clearSessionCacheEntries();
        // Set default redirectUrl
        this.redirectUrl = '/';

        return this.authService.login(username, password).pipe(
            switchMap((userFromApi: any) => {
                const user = User.apiToModel(userFromApi);
                if (user.get('twoFactorAuthentication')) {
                    return this.twoFALogin(userFromApi);
                } else {
                    this.userService.setCurrentUser(user);
                    return this.asyncacheService.setUser(userFromApi).pipe(
                        switchMap((_: any) => {
                            return this.loginRoutine(user);
                        })
                    );
                }
            }),
            tap(() => { this.redirect(); })
        );
    }

    public twoFALogin(userFromApi: any): Observable<Boolean> {
        const user = User.apiToModel(userFromApi);
        const phoneNumber = user.get('phonePrefix') + '' +  user.get('phoneNumber');
        this.code = this.randomIntFromInterval(10000, 99999);
        this.user = userFromApi;

        const body = {
            recipients: [phoneNumber],
            message: this.language.login_two_fa_message + ': ' + this.code
        };
        this.authService.sendSMS(body).subscribe();
        return of(false);
    }

    public authenticateCode(twoFactorCode: any): Observable<any> {
        if (this.code === twoFactorCode) {
            this.userService.setCurrentUser(User.apiToModel(this.user));
            return this.asyncacheService.setUser(this.user).pipe(
                switchMap((_: any) => {
                    return this.loginRoutine(User.apiToModel(this.user));
                })
            );
        } else {
            return of(false);
        }
    }

    // Login back using the token in the cache
    public reLogin(user: User) {
        // Reset redirect url
        this.redirectUrl = undefined;
        return this.loginRoutine(user).pipe(tap((_) => {
            this.redirect();
        }));
    }

    // Clear the last session's cache entries
    public clearSessionCacheEntries(): void {
        this.asyncacheService.removeCountry();
        this.asyncacheService.removeLanguage();
    }

    public loginRoutine(user: User) {
        return forkJoin({
            country: this.setCountries(user),
            language: this.setLanguage(user),
            user: this.setUser(user),
        });
    }

    // Redirect to profile if the user needs to change their password
    private redirect() {
        // Redirect only if redirectUrl has been set, otherwise stay on the same page
        if (this.redirectUrl) {
            this.router.navigateByUrl(this.redirectUrl);
        }
    }

    // Set user's available countries
    private setCountries(user: User) {
        // Get current user's country (only set when user only has one country)
        const countries = user.get<Array<Country>>('countries');
        if (! countries) {
            const projects = user.get<Array<Project>>('projects');

            if (projects && projects.length) {
                const countriesSet = new Set(projects.map((project: Project) => {
                    return this.countriesService.stringToCountry(project.get<string>('iso3'));
                }));
                this.countriesService.fillWithCountries(Array.from(countriesSet));
            } else {
                // User is admin
                this.countriesService.fillWithAllExistingCountries();
            }
        } else {
            this.countriesService.fillWithCountries(countries);
        }
        return this.setServiceCountry(countries ? countries[0] : undefined);
    }

    // Set the user's default selected country
    private setServiceCountry(country: Country) {
        if (!country) {
            country = this.countriesService.selectableCountries[0];
        }

        return this.asyncacheService.getCountry().pipe(
            tap((cachedCountry: CachedCountryReturnValue) => {
                if (cachedCountry) {
                    this.countriesService.selectedCountry = cachedCountry.country;
                    // If the country has just been changed, redirect to home page
                    if (cachedCountry.updatedInLastSession) {
                        this.redirectUrl = '/';
                    }
                } else {
                    this.countriesService.selectedCountry = country;
                }
            }),
        );
    }

    // Set the user in service
    private setUser(user: User) {
        if (user.get<boolean>('changePassword') === true) {
            this.redirectUrl = '/profile';
            this.snackbar.success(this.language.profile_change_password);
        }
        return of(this.userService.setCurrentUser(user));
    }

    // Set the language in cache
    private setLanguage(user: User): Observable<Language> {
        return this.asyncacheService.getLanguage().pipe(
            switchMap(language => {
                if (language) {
                    this.languageService.selectedLanguage = language;
                    return of(undefined);
                }
                else {
                    return this.setDefaultLanguage(user);
                }
            })
        );

    }

    // Set user's default language
    private setDefaultLanguage(user: User) {
        const language = this.languageService.stringToLanguage(user.get<string>('language'));
        this.languageService.selectedLanguage = language;
        return this.asyncacheService.setLanguage(language);
    }

    /**
     * -------------------- UTILS ----------------------
     */

     /**
      * Calculates a random number in a range
      * @param min minimum value
      * @param max maximum value
      */
    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
