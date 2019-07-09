import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { User } from 'src/app/models/user';
import { UserService } from '../api/user.service';
import { SnackbarService } from '../logging/snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor (
        private router: Router,
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService,
        public languageService: LanguageService,
        ) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {

        if (this.userService.currentUser === undefined) {
            return this.authenticationService.getUser()
            .pipe(
                map((user: User) => {
                    if (user) {
                        this.userService.currentUser = User.apiToModel(user);
                    }
                return this.checkPermissionsWrapper(route);
            }));
        }
        else {
            return this.checkPermissionsWrapper(route);
        }

    }

    private checkPermissionsWrapper (route: ActivatedRouteSnapshot): boolean {
        const permissionGranted = this.checkPermissions(route, this.userService.currentUser);

        if (!permissionGranted) {
            this.snackbar.error(this.language.forbidden_message);
            this.router.navigateByUrl('');
        }

        return permissionGranted;
    }

    private checkPermissions(route: ActivatedRouteSnapshot, user: User): boolean {

        const segmentedRoute = route.url.map((urlSegment: UrlSegment) => urlSegment.path);

        // Deny access to distributions if the user is not authorized
        if (segmentedRoute.slice(0, 2).join('/') === 'projects/distributions') {
            return (this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT_WRITE'));
        }
        return true;

    }
}


