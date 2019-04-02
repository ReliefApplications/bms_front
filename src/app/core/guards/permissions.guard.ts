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

        if (!this.userService.currentUser) {
            return this.authenticationService.getUser().pipe(
                map((user: User) => {
                    this.userService.currentUser = user;
                    return this.checkPermissions(route);
                }
            )
        );
        } else {
            return this.checkPermissions(route);
        }
    }

    private checkPermissions(route: ActivatedRouteSnapshot): boolean {

        // If route is undefined (on landing page), the route is set to empty string
        const segmentedRoute = route.url.map((urlSegment: UrlSegment) => urlSegment.path);
        let hasPermissions: boolean;

        if (segmentedRoute.slice(0, 2).join('/') === 'projects/distributions') {
            hasPermissions = this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT');
        }

        else if (segmentedRoute[0] === 'settings') {
            hasPermissions = this.userService.hasRights('ROLE_VIEW_ADMIN_SETTINGS');
        }

        else if (segmentedRoute[0] === 'login') {
            hasPermissions = true;
        }
        // Make sure the user is logged in
        else {
            hasPermissions = this.userService.currentUser !== new User();
        }

        if (!hasPermissions) {
            this.snackbar.error(GlobalText.TEXTS.forbidden_message);
            this.router.navigate(['']);
        }
        return hasPermissions;
    }
}
