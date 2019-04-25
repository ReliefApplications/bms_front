import { FormGroup } from '@angular/forms';
import { Language } from 'src/texts/language';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { CustomModel } from './CustomModel/custom-model';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Project } from './project.new';

export class ErrorInterface {
    message: string;
}

export class Country extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class Role extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    language: Language;

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);

    }
}
export class User extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = 'model_user';
    matSortActive = 'email';

    public fields = {
        id: new NumberModelField({

        }),
        username: new TextModelField({
            title: 'login_username',
        }),
        email: new TextModelField({
            title: 'email',
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isRequired: true,
            pattern: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
            isSettable: true,
        }),
        password: new TextModelField({
            title: 'model_password',
            isPassword: true,
            isRequired: true,
            pattern:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
        }),
        rights: new SingleSelectModelField({
            title: 'rights',
            isDisplayedInTable: true,
            options: [
                new Role('ROLE_ADMIN', this.language.role_user_admin),
                new Role('ROLE_FIELD_OFFICER', this.language.role_user_field_officer),
                new Role('ROLE_PROJECT_OFFICER', this.language.role_user_project_officer),
                new Role('ROLE_PROJECT_MANAGER', this.language.role_user_project_manager),
                new Role('ROLE_COUNTRY_MANAGER', this.language.role_user_country_manager),
                new Role('ROLE_REGIONAL_MANAGER', this.language.role_user_regional_manager),
            ],
            bindField: 'name',
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            isTrigger: true,
            triggerFunction: (user: User, value: string, form: FormGroup) => {
                if (value === 'ROLE_REGIONAL_MANAGER' ||
                value === 'ROLE_REGIONAL_MANROLE_COUNTRY_MANAGERAGER' ||
                value === 'ROLE_READ_ONLY' ) {
                    form.controls.countries.enable();
                    form.controls.projects.disable();

                } else if (value === 'ROLE_PROJECT_MANAGER' ||
                value === 'ROLE_PROJECT_OFFICER' ||
                value === 'ROLE_FIELD_OFFICER') {
                    form.controls.projects.enable();
                    form.controls.countries.disable();
                } else {
                    form.controls.countries.disable();
                    form.controls.projects.disable();
                }
                return user;
            },
        }),
        loggedIn: new BooleanModelField({
            value: false,
        }),
        projects: new MultipleSelectModelField({
            title: 'project',
            isDisplayedInModal: true,
            bindField: 'name',

        }),
        countries: new MultipleSelectModelField({
            title: 'model_countryIso3',
            options: [new Country('KHM', 'Cambodia'), new Country('SYR', 'Syria')],
            isDisplayedInModal: true,
            bindField: 'name',
        }),
        language: new TextModelField({

        })

    };

    public static apiToModel(userFromApi: any): User {
        const newUser = new User();
        newUser.set('rights', userFromApi.roles ?
            newUser.getOptions('rights').filter((role: Role) => role.get('id') === userFromApi.roles[0])[0] :
            null);
        newUser.set('countries', userFromApi.countries ?
            userFromApi.countries.map((countryFromApi: any) => {
                return newUser.getOptions('countries').filter((country: Country) => country.get('id') === countryFromApi.iso3)[0];
            }) :
            null);
        newUser.set('projects', userFromApi.user_projects ?
            userFromApi.user_projects.map((project: any) => {
                if (newUser.get<Country[]>('countries').filter((country) => country.get('name') === project.project.iso3).length > 0) {
                    newUser.add('countries', new Country(null, project.project.iso3));
                }
                return Project.apiToModel(project.project);
            }) :
            null);
        newUser.set('password', userFromApi.password);
        newUser.set('email', userFromApi.email);
        newUser.set('username', userFromApi.username);
        newUser.set('id', userFromApi.id);
        newUser.set('loggedIn', userFromApi.loggedIn);
        newUser.set('language', userFromApi.language);
        return newUser;
    }

    public modelToApi(): object {
        const userForApi = {
            id: this.get('id'),
            email: this.get('email'),
            username: this.get('email'),
            password: this.get('password'),
            language: this.get('language'),
            roles: (this.get('rights') ? [this.get('rights').get('id')] : null),
            vendor: null,
            loggedIn: this.get('loggedIn')
        };

        if (!this.get('rights')) {
            return userForApi;
        }

        if (this.get('rights').get<string>('id') === 'ROLE_REGIONAL_MANAGER' ||
        this.get('rights').get<string>('id') === 'ROLE_REGIONAL_MANROLE_COUNTRY_MANAGERAGER' ||
        this.get('rights').get<string>('id') === 'ROLE_READ_ONLY') {
            userForApi['country'] = this.fields.countries.value ?
            this.fields.countries.value.map((country: Country) => country.get('id')) :
            null;
        } else if (this.get('rights').get<string>('id') === 'ROLE_PROJECT_MANAGER' ||
        this.get('rights').get<string>('id') === 'ROLE_PROJECT_OFFICER' ||
        this.get('rights').get<string>('id') === 'ROLE_FIELD_OFFICER') {
            userForApi['projects'] = this.fields.projects.value ?
                this.fields.projects.value.map((project: Project) => project.get('id')) :
                null;
        }
        return userForApi;
    }
    // // Todo: remove this (temporary fix)
    // public getAllCountries() {
    //     return [
    //         {
    //             'id': 'KHM',
    //             'name': 'Cambodia',
    //         },
    //         {
    //             'id': 'SYR',
    //             'name': 'Syria',
    //         }
    //     ];
    // }
}
