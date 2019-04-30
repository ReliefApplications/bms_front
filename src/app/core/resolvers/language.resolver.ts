import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { isObservable, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { User } from 'src/app/model/user.new';
import { Language } from 'src/texts/language';
import { LanguageService } from '../../../texts/language.service';
import { AppInjector } from '../../app-injector';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable(({
    providedIn: 'root'
}))
export class LanguageResolver implements Resolve<Language | Observable<Language>> {

    private userService = AppInjector.get(UserService);
    private languageService = AppInjector.get(LanguageService);
    private asyncCacheService = AppInjector.get(AsyncacheService);
    private router = AppInjector.get(Router);


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Language | Observable<Language> {

        // Language is already selected and previous page is not login
        if (this.router.url !== '/login' && this.languageService.enabledLanguages.includes(this.languageService.selectedLanguage)) {
            return this.languageService.selectedLanguage;
        }

        const defaultLanguage = this.getDefault();

        if (isObservable(defaultLanguage)) {
            return defaultLanguage.pipe(
                tap((language: Language) => {
                    this.languageService.selectedLanguage = language;
                })
            );
        }

        this.languageService.selectedLanguage = defaultLanguage;
        return defaultLanguage;
    }

    getDefault(): Language | Observable<Language> {
        // User does not exist (login page)
        if (!this.userService.currentUser) {
            return this.languageService.english;
        }

        // Else fetch language stored in cache
        return this.asyncCacheService.getLanguage().pipe(

            switchMap((cacheLanguage: Language) => {
                if (cacheLanguage) {
                    this.languageService.selectedLanguage = cacheLanguage;
                    return of(cacheLanguage);
                }
                return this.asyncCacheService.getUser().pipe(
                    map((user: User) => {
                        if (!user) {
                            return this.languageService.english;
                        }
                        return this.languageService.stringToLanguage(user.get<string>('language'));
                    })
                );
            })
        );


    }
}
