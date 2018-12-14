import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { WsseService } from './wsse.service';

import { URL_BMS_API } from '../../../environments/environment';
import { User, ErrorInterface } from '../../model/user';
import { SaltInterface } from '../../model/salt';
import { AsyncacheService } from '../storage/asyncache.service';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private user: User;

    constructor(
        public _wsseService: WsseService,
        public _cacheService: AsyncacheService,
        public http: HttpClient,
        public router: Router
    ) { }

    // Request to the API to get the salt corresponding to a username
    requestSalt(username) {
        this._wsseService.setUsername(username);
        return this.http.get(URL_BMS_API + '/salt/' + username);
    }

    logUser(user) {
        return this.http.post(URL_BMS_API + '/login', user);
    }


    checkCredentials() {
        return this.http.get<any>(URL_BMS_API + '/check');
    }

    login(user: User) {
        return new Promise<User | ErrorInterface | null>((resolve, reject) => {
            this.requestSalt(user.username).subscribe(success => {
                let getSalt = success as SaltInterface;
                user.salted_password = this._wsseService.saltPassword(getSalt.salt, user.password);
                delete user.password;
                this.logUser(user).subscribe(success => {
                    let data = success;

                    if (data) {
                        this.user = data as User;
                        this.user.loggedIn = true;
                        let voters = this.rightAccessDefinition(this.user);
                        //add with voters definition
                        // if (Object.keys(voters).length == 0) {
                        //     reject({ message: 'Pas assez de droits' });
                        // }

                        this.user.voters = voters;
                        this.setUser(this.user);

                        resolve(this.user)
                    } else {
                        reject({ message: 'Bad credentials' })
                    }
                }, error => {
                    reject({ message: 'Bad credentials' })
                });
            }, error => {
                reject({ message: 'User not found' })
            });
        });
    }

    logout() : Observable<User> {
        this.resetUser();
        this.user.loggedIn = false;
        return this._cacheService.clear().pipe(
            map(
                () => { return this.user }
            )
        );
    }

    getUser(): Observable<User> {
        return this._cacheService.getUser();
    }

    setUser(user: User) {
        this.user = user;
        this._cacheService.set(AsyncacheService.USER, user);
    }

    resetUser() {
        this.user = new User();
        this._cacheService.remove(AsyncacheService.USER);
    }

    rightAccessDefinition(user: User) {
        let voters: string = '';
        voters = user.voters;
        return voters;
    }

    public createUser(body: any, salt: any) {
        let saltedPassword = this._wsseService.saltPassword(salt.salt, body.password);
        this._wsseService.setSalted(saltedPassword);
        body.password = saltedPassword;
        body.salt = salt.salt;

        return this.http.put(URL_BMS_API + "/users", body);
    }
}
