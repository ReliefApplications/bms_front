import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router     } from '@angular/router';

import { WsseService } from './wsse.service';
import { CacheService } from '../storage/cache.service';

import { URL_BMS_API } from '../../../environments/environment';
import { UserInterface, ErrorInterface } from '../../model/interfaces';

@Injectable({
	providedIn: 'root'
})
export class AuthenticationService {

	private user : UserInterface;
	constructor(
		public _wsseService: WsseService,
		public _cacheService: CacheService,
		public http: HttpClient,
		public router: Router
	) { }

	// Request to the API to get the salt corresponding to a username
	requestSalt(username) {
		this._wsseService.setUsername(username);
		return this.http.get(URL_BMS_API + '/salt/' + username);
    }
    
    logUser(user){
		return this.http.post(URL_BMS_API + '/login', user);        
    }

	checkCredentials() {
		return this.http.get<any>(URL_BMS_API + '/check');
	}

	login(user: UserInterface) {
        return new Promise<UserInterface | ErrorInterface | null>((resolve, reject) => {
            this.requestSalt(user.username).subscribe(success => {
                user.salted_password = this._wsseService.saltPassword(success, user.password);
                this.logUser(user).subscribe(success => {
                    let data = success;

                    if (data) {
						console.log("Successfully logged in", success);
                        
                        this.user = data as UserInterface;
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

	logout() {
        this.resetUser();
        this.user.loggedIn = false;
        this._cacheService.clear();
    }

    getUser(): UserInterface {
        return this._cacheService.get(CacheService.USER) || new UserInterface();
    }

    setUser(user: UserInterface) {
        this.user = user;
        this._cacheService.set(CacheService.USER, user);
    }

    resetUser() {
        this.user = new UserInterface();
        this._cacheService.remove(CacheService.USER);
    }
	
	rightAccessDefinition(user: UserInterface) {
        let voters: any = {};
        // user.role.forEach((item: string, index: number, array) => {
        	//add voters 
        // })
        return voters;
    }
}
