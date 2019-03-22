import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { WsseService } from '../authentication/wsse.service';
import { User, ErrorInterface } from '../../model/user';
import { SaltInterface } from '../../model/salt';
import { AuthenticationService } from '../authentication/authentication.service';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private wsseService: WsseService,
        private authenticationService: AuthenticationService
    ) {
    }


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

    public updatePassword(user: any, clearOldPassword: any, clearNewPassword: any) {
        return new Promise<User | ErrorInterface | null>((resolve, reject) => {
            this.authenticationService.requestSalt(user.username).subscribe(success => {
                const getSalt = success as SaltInterface;
                const saltedOldPassword = this.wsseService.saltPassword(getSalt.salt, clearOldPassword);
                const saltedNewPassword = this.wsseService.saltPassword(getSalt.salt, clearNewPassword);
                this.requestPasswordChange(parseInt(user.user_id, 10), { oldPassword: saltedOldPassword, newPassword: saltedNewPassword })
                    .subscribe(data => {
                        this.authenticationService.setUser(data);
                        resolve(data);
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
}
