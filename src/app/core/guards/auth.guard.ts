import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { User } from 'src/app/models/user';
import { LoginService } from '../api/login.service';
import { UserService } from '../api/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor (
        private router: Router,
        private userService: UserService,
        private loginService: LoginService,
        private authenticationService: AuthenticationService,
        public languageService: LanguageService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userService.currentUser === undefined) {
            return this.authenticationService.getUser()
            .pipe(
                switchMap((user: any) => {
                    if (user) {
                        return this.loginService.reLogIn(User.apiToModel(user)).pipe(
                            switchMap((_: any) => of(true))
                        );
                    }
                    return of(this.checkLoginWrapper());
                })
            );
        }
        else {
            return this.checkLoginWrapper();
        }
    }

    private checkLoginWrapper(): boolean {
        const accessGranted = this.checkLogin(this.userService.currentUser);

        if (!accessGranted) {
            this.router.navigateByUrl('/login');
        }

        return accessGranted;
    }

    private checkLogin(user: User): boolean {
        return !(user === undefined || !user.get<number>('id'));
    }
}
