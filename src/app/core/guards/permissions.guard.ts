import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { User } from 'src/app/model/user';
import { GlobalText } from '../../../texts/global';
import { UserService } from '../api/user.service';
import { SnackbarService } from '../logging/snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {

    constructor (
        private router: Router,
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService,
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
                this.userService.currentUser = user;
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
            this.snackbar.error(GlobalText.TEXTS.forbidden_message);
            this.router.navigateByUrl('');
        }

        return permissionGranted;
    }

    private checkPermissions(route: ActivatedRouteSnapshot, user: User): boolean {

        const segmentedRoute = route.url.map((urlSegment: UrlSegment) => urlSegment.path);

        // Deny access to distributions if the user is not authorized
        if (segmentedRoute.slice(0, 2).join('/') === 'projects/distributions') {
            return (this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT'));
        }

        if (segmentedRoute[0] === 'settings') {
            return this.userService.hasRights('ROLE_VIEW_ADMIN_SETTINGS');

        }
        return true;

    }
}


