import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { Project } from 'src/app/model/project.new';
import { SaltInterface } from '../../model/salt';
import { ErrorInterface, User } from '../../model/user.new';
import { AuthenticationService } from '../authentication/authentication.service';
import { WsseService } from '../authentication/wsse.service';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';
import { ProjectService } from './project.service';

@Injectable({
    providedIn: 'root'
})
export class UserService extends CustomModelService {

    constructor(
        protected http: HttpService,
        private wsseService: WsseService,
        private authenticationService: AuthenticationService
    ) {
        super(http);
    }

    public create(body: any) {
        return this.authenticationService.createUser(body);
    }

    public get() {
        const url = this.apiBase + '/web-users';
        return this.http.get(url);
    }


    public update(id: number, body: any) {
        const url = this.apiBase + '/users/' + id;
        return this.authenticationService.updateUser(body, url);
    }

    public delete(id: number, body: any) {
        const url = this.apiBase + '/users/' + id;
        return this.http.delete(url, body);
    }

    public requestPasswordChange(id: number, body: any) {
        const url = this.apiBase + '/users/' + id + '/password';
        return this.http.post(url, body);
    }

    public requestLogs(id: number) {
        const url = this.apiBase + '/users/' + id + '/logs';
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
        const url = this.apiBase + '/users/' + id + '/projects';
        return this.http.get(url);
    }

    public setDefaultLanguage(id: number, body: string) {
        const url = this.apiBase + '/users/' + id + '/language';
        return this.http.post(url, {language: body})
            .pipe(
                tap(_ => {
                    this.authenticationService.getUser().subscribe(user => {
                        user.set('language', body);
                        this.authenticationService.setUser(user);
                    });
                })
            );
    }

    public fillWithOptions(user: User) {
        const appInjector = AppInjector;
        appInjector.get(ProjectService).get().subscribe((projects: any) => {

            const projectOptions = projects.map(project => {
                return Project.apiToModel(project);
            });

            user.setOptions('projects', projectOptions);
        });
    }
}
