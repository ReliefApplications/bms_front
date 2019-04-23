import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { AsyncacheService } from '../storage/asyncache.service';

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
                    console.log(user, user.get<string>('id'));
                    if (!user.get<string>('id')) {
                        this.router.navigate(['/login']);
                        return false;
                    }
                    console.log('passed guard');
                    return true;
                })
            );
    }
}
