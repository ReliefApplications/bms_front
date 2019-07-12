import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { LanguageService } from 'src/app/core/language/language.service';
import { Project } from 'src/app/models/project';
import { rightsHierarchy, Role } from '../../models/constants/permissions';
import { SaltInterface } from '../../models/salt';
import { User } from '../../models/user';
import { AuthenticationService } from '../authentication/authentication.service';
import { WsseService } from '../authentication/wsse.service';
import { CountriesService } from '../countries/countries.service';
import { Language } from '../language/language';
import { HttpService } from '../network/http.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { CustomModelService } from '../utils/custom-model.service';
import { ProjectService } from './project.service';


@Injectable({
    providedIn: 'root'
})
export class UserService extends CustomModelService {

    public currentUser: User;
    projectsService = AppInjector.get(ProjectService);

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
        private wsseService: WsseService,
        private authenticationService: AuthenticationService,
        private asyncacheService: AsyncacheService,
        private countriesService: CountriesService,
    ) {
        super(http, languageService);
        this.getUserFromCache();
    }

    public create(body: any) {
        return this.authenticationService.createUser(body);
    }

    public get() {
        const url = this.apiBase + '/web-users';
        return this.http.get(url);
    }

    public setCurrentUser(user: User) {
        this.currentUser = user;
        return this.currentUser;
    }

    public getUserFromCache(): Observable<User> {
        return this.asyncacheService.getUser().pipe(map((userObject: User) => {
            if (userObject) {
                this.setCurrentUser(userObject);
            }
            return this.currentUser;
        }));
    }

    public resetUser() {
        this.setCurrentUser(undefined);
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
                        this.asyncacheService.setUser(data).subscribe();
                        this.setCurrentUser(user);
                        resolve();
                    }, _error => {
                        reject({ message: 'Wrong password' });
                    });
            }, _error => {
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
        const url = this.apiBase + '/users/' + id + '/language';
        return this.http.post(url, {language});
    }

    public fillWithOptions(user: User) {
        this.projectsService.get().subscribe((projects: any) => {
            if (projects) {
                const projectOptions = projects.map(project => {
                    return Project.apiToModel(project);
                });
                const country = this.countriesService.selectedCountry.get<string>('id') ?
                    this.countriesService.selectedCountry.get<string>('id') :
                    this.countriesService.khm.get<string>('id');
                    if (user.get<Array<Project>>('projects')) {
                        user.get<Array<Project>>('projects').forEach((project: Project) => {
                        if (project.get<string>('iso3') !== country) {
                            projectOptions.push(project);
                        }
                        });
                    }
            user.setOptions('projects', projectOptions);
            }
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
