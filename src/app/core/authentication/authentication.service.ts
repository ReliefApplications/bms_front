import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, mapTo } from 'rxjs/operators';
import { URL_BMS_API } from '../../../environments/environment';
import { SaltInterface } from '../../models/salt';
import { User } from '../../models/user';
import { CountriesService } from '../countries/countries.service';
import { HttpService } from '../network/http.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { WsseService } from './wsse.service';
import { environment } from 'src/environments/environment';



@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private user: User;

    constructor(
        public _wsseService: WsseService,
        public asyncacheService: AsyncacheService,
        public countryService: CountriesService,
        protected http: HttpService,
        public router: Router,
    ) { }

    // Request to the API to get the salt corresponding to a username
    requestSalt(username: string) {
      this._wsseService.setUsername(username);
      return this.http.get(URL_BMS_API + '/salt/' + username);
    }

    initializeUser(username: string) {
      this._wsseService.setUsername(username);
      return this.http.get(URL_BMS_API + '/initialize/' + username);
    }

    logUser(user) {
        return this.http.post(URL_BMS_API + '/login', user);
    }


    checkCredentials() {
        return this.http.get(URL_BMS_API + '/check');
    }

    login(username: string, password: string) {
        return this.requestSalt(username).pipe(
            switchMap((saltInterface: SaltInterface) => {
                const saltedPassword = this._wsseService.saltPassword(saltInterface.salt, password);
                const user = new User().set('email', username).set('password', saltedPassword);
                return this.logUser(user.modelToApi());
            })
        );
    }

    sendSMS(body: any, options: any) {
        return this.http.post('https://api.sms.test.humanitarian.tech/api/order/sms', body, options).pipe(
            mapTo(null)
        );
    }

    logout(): Observable<any> {
        return this.asyncacheService.clear(false);
    }

    getUser(): Observable<User> {
        return this.asyncacheService.getUser();
    }

    setSaltedPassword(user: User, saltedPassword: string) {
        user.set('password', saltedPassword);
    }

    resetUser() {
        this.user = new User();
        this.asyncacheService.removeItem(AsyncacheService.USER);
    }

    public updateUser(body: any, url: string) {
        return this.requestSalt(body.username).pipe(
            switchMap((salt: string) => {
                body = this.createSaltedPassword(body, salt);
                return this.http.post(url, body);
            }));
    }

    public createUser(body: any) {
        return this.initializeUser(body.username)
            .pipe(
                switchMap((salt: string) => {
                    if (salt.length !== 0) {
                        body = this.createSaltedPassword(body, salt);
                        return this.http.put(URL_BMS_API + '/users', body);
                    } else {
                        return of(null);
                    }
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
        const saltedPassword = body.password ? this._wsseService.saltPassword(salt.salt, body.password) : null;
        this._wsseService.setSalted(saltedPassword);
        body.password = saltedPassword;
        body.salt = salt.salt;
        return body;
    }

    public loginHumanitarianID(code: string) {
        const body = {
            code: code,
            environment: environment.name
        };
        return this.http.post(URL_BMS_API + '/login-humanitarian', body);
    }

    public loginGoogle(token: string) {
        const body = {
            token: token
        };
        return this.http.post(URL_BMS_API + '/login-google', body);
    }
}
