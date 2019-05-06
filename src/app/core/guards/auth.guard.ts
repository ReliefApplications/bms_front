import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { User } from 'src/app/model/user';
import { UserService } from '../api/user.service';
import { LanguageService } from './../../../texts/language.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor (
        private router: Router,
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService,
        public languageService: LanguageService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userService.currentUser === undefined) {
            return this.authenticationService.getUser()
            .pipe(
                map((user: User) => {
                this.userService.currentUser = user;
                return this.checkLoginWrapper();
            }));
        }
        else {
            return this.checkLoginWrapper();
        }
    }

    private checkLoginWrapper(): boolean {
        const accessGranted = this.checkLogin(this.userService.currentUser);

        if (!accessGranted) {
            this.snackbar.error(this.language.login_prompt);
            this.router.navigateByUrl('/login');
        }

        return accessGranted;
    }

    private checkLogin(user: User): boolean {
        return !(user === undefined || !user.get<number>('id'));
    }
}
