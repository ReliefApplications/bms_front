import { CustomModel } from './custom-models/custom-model';
import { FileModelField } from './custom-models/file-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';

export class ErrorInterface {
    message: string;
}

export class Organization extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = this.language.settings_organization;
    matSortActive = 'name';

    public fields = {
        id: new NumberModelField({

        }),
        name: new TextModelField({
            title: this.language.model_organization_name,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
        }),
        logo: new TextModelField({
            title: this.language.model_organization_logo,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        logoData: new FileModelField({
            title: this.language.model_organization_logo,
            isDisplayedInModal: true,
            isEditable: true,
            uploadPath: '/organization/upload/logo',
            fileUrlField: 'logo',
            isRequired: true,
        }),
        font: new TextModelField({
            title: this.language.model_organization_font,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
        }),
        primaryColor: new TextModelField({
            title: this.language.model_organization_primary,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
        }),
        secondaryColor: new TextModelField({
            title: this.language.model_organization_secondary,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
        }),
        footerContent: new TextModelField({
            title: this.language.model_organization_footer,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
            isLongText: true,
        })

    };

    public static apiToModel(organizationFromApi: any): Organization {
        const newOrganization = new Organization();
        newOrganization.set('id', organizationFromApi.id);
        newOrganization.set('name', organizationFromApi.name);
        newOrganization.set('logo', organizationFromApi.logo);
        newOrganization.set('font', organizationFromApi.font);
        newOrganization.set('primaryColor', organizationFromApi.primary_color);
        newOrganization.set('secondaryColor', organizationFromApi.secondary_color);
        newOrganization.set('footerContent', organizationFromApi.footer_content);

        return newOrganization;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            name: this.get('name'),
            logo: this.get('logo'),
            font: this.get('font'),
            primary_color: this.get('primaryColor'),
            secondary_color: this.get('secondaryColor'),
            footer_content: this.get('footerContent'),
        };
    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }

}
