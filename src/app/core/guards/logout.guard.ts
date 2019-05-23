import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../api/user.service';

@Injectable({
    providedIn: 'root'
})
export class LogoutGuard implements CanActivate {
    constructor(private userService: UserService) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {

        if (this.userService.currentUser) {
            return false;
        }

        return true;
    }
}
