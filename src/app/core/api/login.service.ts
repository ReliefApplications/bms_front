import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, concat } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Country } from 'src/app/models/country';
import { Project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { AuthenticationService } from '../authentication/authentication.service';
import { CountriesService } from '../countries/countries.service';
import { LanguageService } from '../language/language.service';
import { SnackbarService } from '../logging/snackbar.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { UserService } from './user.service';


@Injectable({
    providedIn: 'root'
})
export class LoginService {


    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor (
        private authService: AuthenticationService,
        private userService: UserService,
        private router: Router,
        private snackbar: SnackbarService,
        private languageService: LanguageService,
        private countriesService: CountriesService,
        private asyncacheService: AsyncacheService,
        ) {}

    public login(username: string, password: string) {
        this.clearSessionCacheEntries();

        return this.authService.login(username, password).pipe(
            switchMap((userFromApi: any) => {
                const user = User.apiToModel(userFromApi);
                this.userService.setCurrentUser(user);
                this.redirect(user);
                return concat(
                    this.asyncacheService.setUser(userFromApi),
                    this.loginRoutine(user)
                );
            })
        );
    }

    public reLogin(user: User) {
        return this.loginRoutine(user);
    }


    private clearSessionCacheEntries(): void {
        this.asyncacheService.removeCountry();
        this.asyncacheService.removeLanguage();
    }

    private loginRoutine(user: User) {
        return forkJoin([
            this.setCountries(user),
            this.setLanguage(user),
            this.setUser(user)
        ]);
    }

    private redirect(user: User) {
        if (user.get<boolean>('changePassword') === true) {
            this.router.navigateByUrl('/profile');
            this.snackbar.info(this.language.profile_change_password);
        } else {
            this.router.navigateByUrl('/');
        }
    }

    // Country

    private setCountries(user: User) {
        const countries = user.get<Array<Country>>('countries');
        if (! countries) {
            const projects = user.get<Array<Project>>('projects');
            if (projects && projects.length) {
                const countriesSet = new Set(projects.map((project: Project) => {
                    return this.countriesService.stringToCountry(project.get<string>('iso3'));
                }));
                this.countriesService.fillWithCountries(Array.from(countriesSet));
            } else {
                this.countriesService.fillWithAllExistingCountries();
            }
        } else {
            this.countriesService.fillWithCountries(countries);
        }
        return this.setServiceCountry(countries ? countries[0] : undefined);
    }

    private setServiceCountry(country: Country) {
        if (!country) {
            country = this.countriesService.selectableCountries.value[0];
        }

        return this.asyncacheService.getCountry().pipe(tap((cacheCountry: Country) => {
            if (!cacheCountry) {
                this.countriesService.setCountry(country);
            }
            this.countriesService.setCountry(cacheCountry);
        }));
    }

    // User

    private setUser(user: User) {
        return of(this.userService.setCurrentUser(user));
    }

    // Language

    private setLanguage(user: User) {
        return this.asyncacheService.getLanguage().pipe(
            switchMap(language => {
                if (language) {
                    this.languageService.setLanguage(language);
                    return of(undefined);
                }
                else {
                    return this.setDefaultLanguage(user);
                }
            })
        );

    }

    private setDefaultLanguage(user: User) {
        const language = this.languageService.stringToLanguage(user.get<string>('language'));
        this.languageService.setLanguage(language);
        return this.asyncacheService.setLanguage(language);
    }
}
