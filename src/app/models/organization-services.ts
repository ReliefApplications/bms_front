import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { BooleanModelField } from './custom-models/boolan-model-field';
import { ObjectModelField } from './custom-models/object-model-field';

export class OrganizationServices extends CustomModel {

    title = 'Organization Services';
    matSortActive = 'name';

    public fields = {
        id: new NumberModelField({

        }),
        name: new TextModelField({
            title: 'Service Name',
            isDisplayedInModal: true,
            isDisplayedInTable: true,
        }),
        country: new TextModelField({
            title: 'Country',
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),
        parameters: new ObjectModelField({
            title: 'Parameters',
            isDisplayedInModal: true,
            // isDisplayedInTable: false,
            // displayModalFunction: null,
            isEditable: true
        }),
        parametersSchema: new ObjectModelField({
        }),
        enabled: new BooleanModelField({
            title: 'Enabled',
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isEditable: true
        }),
    };

    public static apiToModel(organizationServicesFromApi: any): OrganizationServices {
        const newOrganizationServices = new OrganizationServices();
        newOrganizationServices.set('id', organizationServicesFromApi.id);
        newOrganizationServices.set('name', organizationServicesFromApi.service.name);
        newOrganizationServices.set('country', organizationServicesFromApi.service.country);
        newOrganizationServices.set('enabled', organizationServicesFromApi.enabled);
        newOrganizationServices.set('parameters', organizationServicesFromApi.parameters_value);
        newOrganizationServices.set('parametersSchema', organizationServicesFromApi.service.parameters.properties);
        newOrganizationServices.fields.parameters.displayModalFunction = (value) => null;

        return newOrganizationServices;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            enabled: this.fields.enabled.formatForApi(),
            parameters: this.fields.parameters.value,
        };
    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }

    public isPrintable() {
        return true;
    }

}
