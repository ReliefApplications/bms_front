import { GlobalText } from '../../texts/global';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { CustomModel } from './CustomModel/custom-model';
import { Project } from './project.new';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';

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

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}
export class User extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = GlobalText.TEXTS.model_user;

    public fields = {
        id: new NumberModelField({

        }),
        username: new TextModelField({

        }),
        email: new TextModelField({
            title: GlobalText.TEXTS.email,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            pattern: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
            isSettable: true,
        }),
        password: new TextModelField({
            title: GlobalText.TEXTS.model_password,
            isPassword: true,
            pattern:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
        }),
        saltedPassword: new TextModelField({

        }),
        rights: new SingleSelectModelField({
            title: GlobalText.TEXTS.rights,
            isDisplayedInTable: true,
            options: [
                new Role('ROLE_ADMIN', GlobalText.TEXTS.role_user_admin),
                new Role('ROLE_FIELD_OFFICER', GlobalText.TEXTS.role_user_field_officer),
                new Role('ROLE_PROJECT_OFFICER', GlobalText.TEXTS.role_user_project_officer),
                new Role('ROLE_PROJECT_MANAGER', GlobalText.TEXTS.role_user_project_manager),
                new Role('ROLE_COUNTRY_MANAGER', GlobalText.TEXTS.role_user_country_manager),
                new Role('ROLE_REGIONAL_MANAGER', GlobalText.TEXTS.role_user_regional_manager),
            ],
            bindField: 'name',
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            isTrigger: true,
            triggerFunction: (user: User) => {
                if (user.get('rights').get<string>('id') === 'ROLE_REGIONAL_MANAGER' ||
                user.get('rights').get<string>('id') === 'ROLE_REGIONAL_MANROLE_COUNTRY_MANAGERAGER' ||
                user.get('rights').get<string>('id') === 'ROLE_READ_ONLY' ) {
                    user.fields.countries.isSettable = true;

                } else if (this.get('rights').get<string>('id') === 'ROLE_PROJECT_MANAGER' ||
                this.get('rights').get<string>('id') === 'ROLE_PROJECT_OFFICER' ||
                this.get('rights').get<string>('id') === 'ROLE_FIELD_OFFICER') {
                    user.fields.projects.isSettable = true;
                }
                return user;
            },
        }),
        loggedIn: new BooleanModelField({
            value: false,
        }),
        projects: new MultipleSelectModelField({
            title: GlobalText.TEXTS.project,
            isDisplayedInModal: true,
            displayModalFunction: null,
            bindField: 'name',

        }),
        countries: new MultipleSelectModelField({
            title: GlobalText.TEXTS.model_countryIso3,
            options: [new Country('KHM', 'Cambodia'), new Country('SYR', 'Syria')],
            isDisplayedInModal: true,
        }),
        language: new TextModelField({

        })

    };

    public static apiToModel(userFromApi: any): User {
        const newUser = new User();
        newUser.set('rights', newUser.getOptions('rights').filter((role: Role) => role.get('id') === userFromApi.roles[0])[0]);
        newUser.set('countries', userFromApi.countries.map((countryFromApi: any) => {
            return newUser.getOptions('countries').filter((country: Country) => country.get('id') === countryFromApi.iso3)[0];
        }));
        newUser.set('projects', userFromApi.user_projects.map((project: any) => {
            if (newUser.get<Country[]>('countries').filter((country: Country) => country.get('name') === project.project.iso3).length > 0) {
                newUser.add('countries', new Country(null, project.project.iso3));
            }
            return Project.apiToModel(project.project);
        }));
        newUser.set('saltedPassword', userFromApi.password);
        newUser.set('password', '');
        newUser.set('email', userFromApi.email);
        newUser.set('username', userFromApi.username);
        newUser.set('id', userFromApi.id);
        return newUser;
    }

    public modelToApi(): Object {
        const userForApi = {
            id: this.get('id'),
            email: this.get('email'),
            username: this.get('email'),
            password: this.get('password'),
            language: this.get('language'),
            rights: this.get('rights').get('id'),
            vendor: null,
        };

        if (this.get('rights').get<string>('id') === 'ROLE_REGIONAL_MANAGER' ||
        this.get('rights').get<string>('id') === 'ROLE_REGIONAL_MANROLE_COUNTRY_MANAGERAGER' ||
        this.get('rights').get<string>('id') === 'ROLE_READ_ONLY') {
            userForApi['country'] = this.fields.countries.formatForApi();
        } else if (this.get('rights').get<string>('id') === 'ROLE_PROJECT_MANAGER' ||
        this.get('rights').get<string>('id') === 'ROLE_PROJECT_OFFICER' ||
        this.get('rights').get<string>('id') === 'ROLE_FIELD_OFFICER') {
            userForApi['user_projects'] = this.fields.projects.value ?
                this.fields.projects.value.map((project: Project) => project.modelToApi()) :
                null;
        }
        return userForApi;
    }
}
