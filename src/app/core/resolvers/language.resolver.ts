import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { User } from 'src/app/model/user';
import { AppInjector } from '../../app-injector';
import { Language } from '../language/language';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageResolver implements Resolve<Language | Observable<Language>> {
    private userService = AppInjector.get(UserService);
    public languageService = AppInjector.get(LanguageService);
    private asyncCacheService = AppInjector.get(AsyncacheService);
    private router = AppInjector.get(Router);

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Language | Observable<Language> {
        // Check if language is set in service and is not initial language
        if (this.languageService.enabledLanguages.includes(this.languageService.selectedLanguage)) {
            return this.languageService.languageSubject.value;
        }

        return this.asyncCacheService.getLanguage().pipe(
            switchMap((cacheLanguage: Language) => {
                if (cacheLanguage) {
                    return of(this.languageService.setLanguage(cacheLanguage));
                }
                return this.asyncCacheService.getUser().pipe(
                    map((user: User) => {
                        if (!user) {
                            return this.languageService.setLanguage(this.languageService.enabledLanguages[0]);
                        }
                        return this.languageService.setLanguage(this.languageService.stringToLanguage(user.get<string>('language')));
                    })
                );
            }),
        );
    }
}
