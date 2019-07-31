import { CustomModel } from './custom-models/custom-model';
import { FileModelField } from './custom-models/file-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';

export class ErrorInterface {
    message: string;
}

export class Organization extends CustomModel {

    title = this.language.settings_organization;
    matSortActive = 'name';

    public fields = {
        id: new NumberModelField({

        }),
        name: new TextModelField({
            title: this.language.organization_name,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
        }),
        logo: new TextModelField({
            title: this.language.organization_logo,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        logoData: new FileModelField({
            title: this.language.organization_logo,
            isDisplayedInModal: true,
            isEditable: true,
            uploadPath: '/organization/upload/logo',
            fileUrlField: 'logo',
            acceptedTypes: ['gif', 'jpg', 'jpeg', 'png'],
        }),
        font: new TextModelField({
            title: this.language.organization_font,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
            isFont: true,
        }),
        primaryColor: new TextModelField({
            title: this.language.organization_primary,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
            isColor: true,
        }),
        secondaryColor: new TextModelField({
            title: this.language.organization_secondary,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true,
            isRequired: true,
            isColor: true,
        }),
        footerContent: new TextModelField({
            title: this.language.organization_footer,
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
            id: this.fields.id.formatForApi(),
            name: this.fields.name.formatForApi(),
            logo: this.fields.logo.formatForApi(),
            font: this.fields.font.formatForApi(),
            primary_color: this.fields.primaryColor.formatForApi(),
            secondary_color: this.fields.secondaryColor.formatForApi(),
            footer_content: this.fields.footerContent.formatForApi(),
        };
    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }

    public isPrintable() {
        return true;
    }

}
