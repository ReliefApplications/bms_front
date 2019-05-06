import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { URL_BMS_API } from '../../../environments/environment';
import { SaltInterface } from '../../model/salt';
import { ErrorInterface, User } from '../../model/user';
import { AsyncacheService } from '../storage/asyncache.service';
import { WsseService } from './wsse.service';



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
    requestSalt(username: string) {
      this._wsseService.setUsername(username);
      return this.http.get(URL_BMS_API + '/salt/' + username);
    }

    initializeUser(username: string) {
      this._wsseService.setUsername(username);
      return this.http.get<string>(URL_BMS_API + '/initialize/' + username);
    }

    logUser(user) {
        return this.http.post(URL_BMS_API + '/login', user);
    }


    checkCredentials() {
        return this.http.get<any>(URL_BMS_API + '/check');
    }

    login(username: string, password: string) {
        return new Promise<User | ErrorInterface | null>((resolve, reject) => {
            this.requestSalt(username).subscribe(success => {
                const getSalt = success as SaltInterface;
                const saltedPassword = this._wsseService.saltPassword(getSalt.salt, password);
                const user = new User().set('email', username).set('password', saltedPassword);
                this.logUser(user.modelToApi()).subscribe((userFromApi: object) => {
                    if (userFromApi) {
                        this.user = User.apiToModel(userFromApi);
                        this.user.set('loggedIn', true);
                        this.setUser(this.user);
                        resolve(this.user);
                    } else {
                        reject({ message: 'Bad credentials' });
                    }
                }, _error => {
                    reject({ message: 'Bad credentials' });
                });
            }, _error => {
                reject({ message: 'User not found' });
            });
        });
    }

    logout(): Observable<User> {
        this.resetUser();
        this.user.set('loggedIn', false);
        return this._cacheService.clear(false, [AsyncacheService.COUNTRY]).pipe(
            map(
                () => this.user
            )
        );
    }

    getUser(): Observable<User> {
        return this._cacheService.getUser();
    }

    setUser(user: User) {
        this._cacheService.set(AsyncacheService.USER, user.modelToApi());
    }

    setSaltedPassword(user: User, saltedPassword: string) {
        user.set('password', saltedPassword);
    }

    resetUser() {
        this.user = new User();
        this._cacheService.remove(AsyncacheService.USER);
    }

    public updateUser(body: any, url: string) {
        return this.requestSalt(body.username).pipe(
            map((salt: string) => {
                body = this.createSaltedPassword(body, salt);
                return this.http.post(url, body).subscribe();
            }));
    }

    public createUser(body: any) {
        return this.initializeUser(body.username)
            .pipe(
                switchMap((salt: string) => {
                    body = this.createSaltedPassword(body, salt);
                    return this.http.put(URL_BMS_API + '/users', body);
                })
            );
    }

    public createVendor(body: any) {
        return this.initializeUser(body.username)
            .pipe(
                switchMap((salt: string) => {
                    body = this.createSaltedPassword(body, salt);
                    return this.http.put(URL_BMS_API + '/vendors', body);
                })
            );
    }

    public createSaltedPassword(body: any, salt: any) {
        const saltedPassword = this._wsseService.saltPassword(salt.salt, body.password);
        this._wsseService.setSalted(saltedPassword);
        body.password = saltedPassword;
        body.salt = salt.salt;
        return body;
    }

    public isLoggedIn(): boolean {
        if (!this.user) {
            return false;
        }
        return this.user.get('loggedIn');
    }
}
