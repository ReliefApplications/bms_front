import { FormGroup } from '@angular/forms';
import { AppInjector } from '../app-injector';
import { LocationService } from '../core/api/location.service';
import { CustomModel } from './custom-models/custom-model';
import { NestedFieldModelField } from './custom-models/nested-field';
import { NumberModelField } from './custom-models/number-model-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { Location } from './location';
import { User } from './user';
import { CountriesService } from '../core/countries/countries.service';

export class Vendor extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = this.language.settings_vendors;
    matSortActive = 'username';

    protected countryService = AppInjector.get(CountriesService);
    // Country
    protected country = this.countryService.selectedCountry.getValue().get<string>('id') ?
    this.countryService.selectedCountry.getValue().get<string>('id') :
    this.countryService.khm.get<string>('id');


    public fields = {
        id: new NumberModelField({

        }),
        user: new ObjectModelField<User>({

        }),
        username: new NestedFieldModelField({
            title: this.language.login_username,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            isRequired: true,
            childrenObject: 'user',
            childrenFieldName: 'username',
        }),
        password: new NestedFieldModelField({
            title: this.language.model_password,
            isPassword: true,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            isRequired: true,
            childrenObject: 'user',
            childrenFieldName: 'password',
        }),
        shopName: new TextModelField({
            title: this.language.model_distribution_name,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isRequired: true,
            isSettable: true,
        }),
        shopType: new TextModelField({
            title: this.language.model_type_shop,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isRequired: true,
            isSettable: true,
            isEditable: true,
        }),
        addressStreet: new TextModelField({
            isDisplayedInTable: true,
            title: this.language.add_beneficiary_getAddressStreet,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
        }),
        addressNumber: new TextModelField({
            isDisplayedInTable: true,
            title:  this.language.add_beneficiary_getAddressNumber,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
        }),
        addressPostcode: new TextModelField({
            isDisplayedInTable: true,
            title: this.language.add_beneficiary_getAddressPostcode,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
        }),
        location: new ObjectModelField<Location>({
            isDisplayedInTable: true,
            displayTableFunction: null,
            title: this.language.location,

        }),
        adm1: new NestedFieldModelField({
            title: this.language.adm1[this.country],
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm1',
            isTrigger: true,
            triggerFunction: (vendor: Vendor, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                // vendor.set('adm2', null);
                // vendor.set('adm3', null);
                // vendor.set('adm4', null);
                form.controls.adm2.setValue(null);
                form.controls.adm3.setValue(null);
                form.controls.adm4.setValue(null);
                if (value) {
                    appInjector.get(LocationService).fillAdm2Options(vendor, parseInt(value, 10)).subscribe();
                }
                return vendor;
            },
        }),
        adm2: new NestedFieldModelField({
            title: this.language.adm2[this.country],
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm2',
            isTrigger: true,
            triggerFunction: (vendor: Vendor, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                // vendor.set('adm3', null);
                // vendor.set('adm4', null);
                form.controls.adm3.setValue(null);
                form.controls.adm4.setValue(null);
                if (value) {
                    appInjector.get(LocationService).fillAdm3Options(vendor, parseInt(value, 10)).subscribe();
                }
                return vendor;
            },
        }),
        adm3: new NestedFieldModelField({
            title: this.language.adm3[this.country],
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm3',
            isTrigger: true,
            triggerFunction: (vendor: Vendor, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                // vendor.set('adm4', null);
                form.controls.adm4.setValue(null);
                if (value) {
                    appInjector.get(LocationService).fillAdm4Options(vendor, parseInt(value, 10)).subscribe();
                }
                return vendor;
            },
        }),
        adm4: new NestedFieldModelField({
            title: this.language.adm4[this.country],
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm4',
        }),
    };

    public static apiToModel(vendorFromApi: any): Vendor {
        const newVendor = new Vendor();
        newVendor.set('id', vendorFromApi.id);
        newVendor.set('user', User.apiToModel(vendorFromApi.user));
        newVendor.set('shopName', vendorFromApi.name);
        newVendor.set('shopType', vendorFromApi.shop);
        newVendor.set('addressStreet', vendorFromApi.address_street);
        newVendor.set('addressNumber', vendorFromApi.address_number);
        newVendor.set('addressPostcode', vendorFromApi.address_postcode);
        newVendor.set('location', vendorFromApi.location ? Location.apiToModel(vendorFromApi.location) : null);
        newVendor.fields.location.displayTableFunction = (value: Location) => value ? value.getLocationName() : null;
        newVendor.fields.password.isRequired = false; // No need to enter the password on update

        return newVendor;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            address_number: this.get('addressNumber'),
            address_street: this.get('addressStreet'),
            address_postcode: this.get('addressPostcode'),
            location: this.get('location') ? this.get('location').modelToApi() : null,
            name: this.get('shopName'),
            password: this.get('user').get('password'),
            username: this.get('user').get('username'),
            salt: this.get('user').get('salt'),
            shop: this.get('shopType'),
        };
    }

    public isPrintable(): boolean {
        return true;
    }

    public getIdentifyingName() {
        return this.get('user').get<string>('username');
    }

}
