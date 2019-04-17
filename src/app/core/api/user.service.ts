import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { URL_BMS_API } from '../../../environments/environment';
import { SaltInterface } from '../../model/salt';
import { User } from '../../model/user';
import { AuthenticationService } from '../authentication/authentication.service';
import { WsseService } from '../authentication/wsse.service';
import { rightsHierarchy, Role } from '../permissions/permissions';
import { HttpService } from './http.service';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    readonly api = URL_BMS_API;

    public currentUser: User;

    constructor(
        private http: HttpService,
        private wsseService: WsseService,
        private authenticationService: AuthenticationService,
    ) { }


    public get() {
        const url = this.api + '/web-users';
        return this.http.get(url);
    }


    public update(id: number, body: any) {
        const url = this.api + '/users/' + id;
        return this.http.post(url, body);
    }

    public delete(id: number, body: any) {
        const url = this.api + '/users/' + id;
        return this.http.delete(url, body);
    }

    public requestPasswordChange(id: number, body: any) {
        const url = this.api + '/users/' + id + '/password';
        return this.http.post(url, body);
    }

    public requestLogs(id: number) {
        const url = this.api + '/users/' + id + '/logs';
        return this.http.get(url);
    }

    public updatePassword(user: any, oldPassword: any, newPassword: any) {

        return new Promise<void>((resolve, reject) => {
            this.authenticationService.requestSalt(user.username).subscribe(success => {
                const getSalt = success as SaltInterface;
                const saltedOldPassword = this.wsseService.saltPassword(getSalt.salt, oldPassword);
                const saltedNewPassword = this.wsseService.saltPassword(getSalt.salt, newPassword);
                this.requestPasswordChange(parseInt(user.id, 10), { oldPassword: saltedOldPassword, newPassword: saltedNewPassword })
                    .subscribe(data => {
                        this.authenticationService.setSaltedPassword(user, data.password);
                        this.authenticationService.setUser(user);
                        resolve();
                    }, error => {
                        reject({ message: 'Wrong password' });
                    });
            }, error => {
                reject({ message: 'User not found' });
            });
        });
    }

    public getProjectUser(id: number) {
        const url = this.api + '/users/' + id + '/projects';
        return this.http.get(url);
    }

    public setDefaultLanguage(id: number, body: string) {
        const url = this.api + '/users/' + id + '/language';
        return this.http.post(url, {language: body})
            .pipe(
                tap(_ => {
                    this.authenticationService.getUser().subscribe(user => {
                        user.language = body;
                        this.authenticationService.setUser(user);
                    });
                })
            );
    }

    public hasRights(action: string) {
        // Logged out users have no righ;ts
        if (!this.currentUser || !this.currentUser.id) {
            return false;
        }
        // Admins have every rights
        if (this.currentUser.rights === Role.admin) {
            return true;
        }
        const userRights = rightsHierarchy[this.currentUser.rights];
        return userRights.includes(action);
    }
}
