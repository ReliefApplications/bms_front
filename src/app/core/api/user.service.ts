import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { Project } from 'src/app/model/project';
import { Language } from 'src/texts/language';
import { LanguageService } from 'src/texts/language.service';
import { SaltInterface } from '../../model/salt';
import { User } from '../../model/user';
import { AuthenticationService } from '../authentication/authentication.service';
import { WsseService } from '../authentication/wsse.service';
import { rightsHierarchy, Role } from '../permissions/permissions';
import { AsyncacheService } from '../storage/asyncache.service';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';
import { ProjectService } from './project.service';


@Injectable({
    providedIn: 'root'
})
export class UserService extends CustomModelService {

    public currentUser: User;

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
        private wsseService: WsseService,
        private authenticationService: AuthenticationService,
        private asyncCacheService: AsyncacheService,
    ) {
        super(http, languageService);
    }

    public create(body: any) {
        return this.authenticationService.createUser(body);
    }

    public get() {
        const url = this.apiBase + '/web-users';
        return this.http.get(url);
    }

    public getUserFromCache(): Observable<User> {
        return this.authenticationService.getUser().pipe(map((userObject: any) => {
            this.currentUser = User.apiToModel(userObject);
            return this.currentUser;
        }));
    }

    public resetCacheUser() {
        this.currentUser = undefined;
        this.authenticationService.resetUser();
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

    public setDefaultLanguage(id: number, languageObject: Language): Observable<any[]> {
        const language = this.languageService.languageToString(languageObject);
        this.currentUser.set('language', language);
        const url = this.apiBase + '/users/' + id + '/language';
        return forkJoin(
            [
                this.asyncCacheService.setUser(this.currentUser),
                this.http.post(url, {language})
            ]
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
        // Logged out users have no rights
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
