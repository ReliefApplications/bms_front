import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { GlobalText } from 'src/texts/global';
import { AuthenticationService } from '../authentication/authentication.service';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor (
        private router: Router,
        private cache: AsyncacheService,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.cache.getUser()
            .pipe(
                map(user => {
                    if (!user.id) {
                        this.snackbar.error(GlobalText.TEXTS.not_connected_error);
                        this.router.navigate(['/login']);
                        return false;
                    }

                    return true;
                })
            );
    }
}
