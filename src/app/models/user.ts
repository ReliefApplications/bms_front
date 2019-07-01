import { FormGroup } from '@angular/forms';
import { Language } from '../core/language/language';
import { Country } from './country';
import { BooleanModelField } from './custom-models/boolan-model-field';
import { CustomModel } from './custom-models/custom-model';
import { MultipleSelectModelField } from './custom-models/multiple-select-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { Project } from './project';

export class ErrorInterface {
    message: string;
}

export class Role extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    language: Language;

    constructor(id: string, name: string) {
        super();
        this.set('id', id).set('name', name);

    }
}
export class User extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = this.language.user;
    matSortActive = 'email';

    public fields = {
        id: new NumberModelField({

        }),
        username: new TextModelField({
            title: this.language.username,
        }),
        email: new TextModelField({
            title: this.language.email,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isRequired: true,
            pattern: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
            isSettable: true,
            patternError: this.language.modal_valid_email
        }),
        password: new TextModelField({
            title: this.language.password,
            isPassword: true,
            isRequired: true,
            pattern:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            patternError: this.language.modal_not_enough_strong
        }),
        rights: new SingleSelectModelField({
            title: this.language.rights,
            isDisplayedInTable: true,
            isRequired: true,
            options: [
                new Role('ROLE_ADMIN', this.language.role_user_admin),
                new Role('ROLE_FIELD_OFFICER', this.language.role_user_field_officer),
                new Role('ROLE_PROJECT_OFFICER', this.language.role_user_project_officer),
                new Role('ROLE_PROJECT_MANAGER', this.language.role_user_project_manager),
                new Role('ROLE_COUNTRY_MANAGER', this.language.role_user_country_manager),
                new Role('ROLE_REGIONAL_MANAGER', this.language.role_user_regional_manager),
            ],
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            isTrigger: true,
            triggerFunction: (user: User, value: string, form: FormGroup) => {
                if (value === 'ROLE_REGIONAL_MANAGER' || value === 'ROLE_COUNTRY_MANAGER') {
                    form.controls.countries.enable();
                    form.controls.projects.disable();
                    form.controls.projects.setValue([]);
                    if (value === 'ROLE_COUNTRY_MANAGER') {
                        user.fields.countries.maxSelectionLength = 1;
                        user.fields.countries.hint = 'You can select only one country';
                        form.controls.countries.setValue([]);
                    } else {
                        user.fields.countries.maxSelectionLength = null;
                        user.fields.countries.hint = '';
                    }

                } else if (value === 'ROLE_PROJECT_MANAGER' || value === 'ROLE_PROJECT_OFFICER' || value === 'ROLE_FIELD_OFFICER') {
                    form.controls.projects.enable();
                    form.controls.countries.disable();
                    user.fields.countries.hint = '';
                    form.controls.countries.setValue([]);
                } else {
                    form.controls.countries.disable();
                    form.controls.projects.disable();
                    user.fields.countries.hint = '';
                    form.controls.countries.setValue([]);
                    form.controls.projects.setValue([]);
                }
                return user;
            },
        }),
        projects: new MultipleSelectModelField({
            title: this.language.project,
            isDisplayedInModal: true,
            bindField: 'name',
            apiLabel: 'id',
            isRequired: true,

        }),
        countries: new MultipleSelectModelField({
            title: this.language.country,
            options: [new Country('KHM', this.language.country_khm), new Country('SYR', this.language.country_syr)],
            isDisplayedInModal: true,
            bindField: 'name',
            apiLabel: 'id',
            isRequired: true,
        }),
        language: new TextModelField({

        }),
        changePassword: new BooleanModelField({
            title: this.language.user_password_question,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            value: true,
        })

    };

    public static apiToModel(userFromApi: any): User {

        if (!userFromApi) {
            return null; // If it was retrieved from cache and was null
        }

        const newUser = new User();

        newUser.set('rights', userFromApi.roles ?
            newUser.getOptions('rights').filter((role: Role) => role.get('id') === userFromApi.roles[0])[0] :
            null);
        const rights = newUser.get('rights') ? newUser.get('rights').get<string>('id') : null;
        if (rights === 'ROLE_REGIONAL_MANAGER' || rights === 'ROLE_COUNTRY_MANAGER') {
            newUser.fields.countries.isEditable = true;

            if (rights === 'ROLE_COUNTRY_MANAGER') {
                newUser.fields.countries.maxSelectionLength = 1;
                newUser.fields.countries.hint = 'You can select only one country';
            }
        }
        if (rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_PROJECT_OFFICER' || rights === 'ROLE_FIELD_OFFICER') {
            newUser.fields.projects.isEditable = true;
        }

        // TO DO : make the cache and the back coherent by sending the same key that we receive
        let countries = [];
        if (userFromApi.countries && userFromApi.countries.length > 0) {
            countries = userFromApi.countries;
        } else if (userFromApi.country && userFromApi.country.length > 0) {
            countries = userFromApi.country;
        } else if (userFromApi.user_projects && userFromApi.roles[0] !== 'ROLE_ADMIN') {
            countries = userFromApi.user_projects.map((project) => project.project.iso3);
        }


        newUser.set('countries', countries ?
            countries.map((countryFromApi: any) => {
                return newUser.getOptions('countries').filter((country: Country) => {
                    // TO DO : same as above
                    const formattedCountryFromApi = countryFromApi.iso3 ? countryFromApi.iso3 : countryFromApi;
                    return country.get('id') === formattedCountryFromApi;
                })[0];
            }) :
            null);

        newUser.set('projects', userFromApi.user_projects ?
            userFromApi.user_projects.map((project: any) => {
                return Project.apiToModel(project.project);
            }) :
            null);

        newUser.set('password', userFromApi.password);
        newUser.fields.password.isRequired = false; // No need to enter the password on update
        newUser.set('email', userFromApi.email);
        newUser.set('username', userFromApi.username);
        newUser.set('id', userFromApi.id);
        newUser.set('language', userFromApi.language ? userFromApi.language : 'en' );
        newUser.set('changePassword', userFromApi.change_password);

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
            change_password: this.get('changePassword')
        };

        if (!this.get('rights')) {
            return userForApi;
        }
        userForApi['country'] = this.fields.countries.value ?
            this.fields.countries.value.map((country: Country) => country.get('id')) :
            null;
        userForApi['projects'] = this.fields.projects.value ?
            this.fields.projects.value.map((project: Project) => project.get('id')) :
            null;

        return userForApi;
    }

    public getIdentifyingName() {
        return this.get<string>('username');
    }
}
