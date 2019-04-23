import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { Project } from 'src/app/model/project.new';
import { ErrorInterface, User } from '../../model/user.new';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';
import { ProjectService } from './project.service';
import { URL_BMS_API } from '../../../environments/environment';
import { SaltInterface } from '../../model/salt';
import { AuthenticationService } from '../authentication/authentication.service';
import { WsseService } from '../authentication/wsse.service';
import { rightsHierarchy, Role } from '../permissions/permissions';


@Injectable({
    providedIn: 'root'
})
export class UserService extends CustomModelService {

    public currentUser: User;

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

    public updatePassword(user: User, oldPassword: any, newPassword: any) {

        return new Promise<void>((resolve, reject) => {
            this.authenticationService.requestSalt(user.get<string>('username')).subscribe(success => {
                const getSalt = success as SaltInterface;
                const saltedOldPassword = this.wsseService.saltPassword(getSalt.salt, oldPassword);
                const saltedNewPassword = this.wsseService.saltPassword(getSalt.salt, newPassword);
                this.requestPasswordChange(parseInt(user.get('id'), 10), { oldPassword: saltedOldPassword, newPassword: saltedNewPassword })
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

    public hasRights(action: string) {
        // Logged out users have no righ;ts
        if (!this.currentUser || !this.currentUser.get('id')) {
            return false;
        }
        // Admins have every rights
        if (this.currentUser.get('rights').get<string>('id') === Role.admin) {
            return true;
        }
        const userRights = rightsHierarchy[this.currentUser.get('rights').get<string>('id')];
        return userRights.includes(action);
    }
}
