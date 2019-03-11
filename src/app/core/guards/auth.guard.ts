import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AsyncacheService } from '../storage/asyncache.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor (
        private router: Router,
        private cache: AsyncacheService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.cache.getUser()
            .pipe(
                map(user => {
                    if (!user.id) {
                        this.router.navigate(['/login']);
                        return false;
                    }

                    return true;
                })
            );
    }
}
