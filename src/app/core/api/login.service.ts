import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
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
import { OrganizationServicesService } from './organization-services.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {


    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    private redirectUrl = '';
    private code: number;
    private user: any;
    private twoFactorStep = false;

    constructor(
        private authService: AuthenticationService,
        private userService: UserService,
        private router: Router,
        private snackbar: SnackbarService,
        private languageService: LanguageService,
        private countriesService: CountriesService,
        private asyncacheService: AsyncacheService,
        private organizationServicesService: OrganizationServicesService
    ) { }

    // Login from the login page
    public login(username: string, password: string) {
        this.clearSessionCacheEntries();
        // Set default redirectUrl
        this.redirectUrl = '/';

        return this.authService.login(username, password).pipe(
            switchMap((userFromApi: any) => {
                return this.manage2FA(userFromApi);
            }),
            tap(() => { this.redirect(); })
        );
    }

    public getTwoFactorStep() {
        return this.twoFactorStep;
    }

    public manage2FA(userFromApi) {
        return this.organizationServicesService.get2FAToken(userFromApi).pipe(
            switchMap((token: any) => {
                if (token && User.apiToModel(userFromApi).get('twoFactorAuthentication')) {
                    this.redirectUrl = '/sso';
                    return this.sendCode(userFromApi, token);
                } else {
                    return this.setUserCache(userFromApi);
                }
            })
        );
    }

    public setUserCache(userFromApi) {
        const user = User.apiToModel(userFromApi);
        this.userService.setCurrentUser(user);
        return this.asyncacheService.setUser(userFromApi).pipe(
            switchMap((_: any) => {
                return this.loginRoutine(user);
            })
        );
    }

    public sendCode(userFromApi: any, token: string) {
        this.user = userFromApi;
        this.twoFactorStep = true;
        const user = User.apiToModel(userFromApi);
        const phoneNumber = user.get('phonePrefix') + '' + user.get('phoneNumber');
        this.code = this.randomIntFromInterval(10000, 99999);

        const body = {
            recipients: [phoneNumber],
            message: this.language.login_two_fa_message + ': ' + this.code
        };

        const options = {
            headers: { 'Authorization': token }
        };
        return this.authService.sendSMS(body, options);
    }

    public authenticateCode(twoFactorCode: Number): Observable<any> {
        if (this.code === twoFactorCode) {
            return this.setUserCache(this.user);
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
        if (!countries) {
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
     * Calculates a random number in a range
     * @param min minimum value
     * @param max maximum value
     */
    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
