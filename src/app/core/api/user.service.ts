import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { WsseService } from '../authentication/wsse.service';
import { User, ErrorInterface } from '../../model/user';
import { SaltInterface } from '../../model/salt';
import { AuthenticationService } from '../authentication/authentication.service';
import { map } from 'rxjs/operators';

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
		let url = this.api + "/users";
		return this.http.get(url);
	}

	public update(id: number, body: any) {
		let url = this.api + "/users/" + id;
		return this.http.post(url, body);
	}

	public delete(id: number, body: any) {
		let url = this.api + "/users/" + id;
		return this.http.delete(url, body);
	}

	public requestPasswordChange(id: number, body: any) {
		let url = this.api + "/users/" + id + "/password";
		return this.http.post(url, body);
	}

    public requestLogs(id: number) {
        let url = this.api + '/users/' + id + '/logs';
        return this.http.get(url);
    }

	public updatePassword(user: any, clearOldPassword: any, clearNewPassword: any) {
		return new Promise<User | ErrorInterface | null>((resolve, reject) => {
			this.authenticationService.requestSalt(user.username).subscribe(success => {
				let getSalt = success as SaltInterface;
				let saltedOldPassword = this.wsseService.saltPassword(getSalt.salt, clearOldPassword);
				let saltedNewPassword = this.wsseService.saltPassword(getSalt.salt, clearNewPassword);
				this.requestPasswordChange(parseInt(user.user_id), { oldPassword: saltedOldPassword, newPassword: saltedNewPassword })
					.subscribe(success => {
						let data = success;
						//console.log("Password changed", success);
						this.authenticationService.setUser(data);
						resolve(data);
					}, error => {
						reject({ message: 'Wrong password' })
					});
			}, error => {
				reject({ message: 'User not found' })
			});
		});
	}

	public getProjectUser(id: number){
		let url = this.api + "/users/" + id + "/projects";
		return this.http.get(url);
	}
}
