import { GlobalText } from '../../texts/global';
import { User } from './user.new';
import { NumberModelField } from './CustomModel/number-model-field';
import { CustomModel } from './CustomModel/custom-model';
import { ObjectModelField } from './CustomModel/object-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Location } from './location.new';
import { NestedFieldModelField } from './CustomModel/nested-field';
import { UserService } from '../core/api/user.service';
import { LocationService } from '../core/api/location.service';
import { AppInjector } from '../app-injector';
import { FormGroup } from '@angular/forms';

export class ErrorInterface {
    message: string;
}

export class Vendor extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = GlobalText.TEXTS.settings_vendors;
    matSortActive = 'username';

    public fields = {
        id: new NumberModelField({

        }),
        user: new ObjectModelField<User>({

        }),
        username: new NestedFieldModelField({
            title: GlobalText.TEXTS.login_username,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isSettable: true,
            childrenObject: 'user',
            childrenFieldName: 'username',
        }),
        password: new NestedFieldModelField({
            title: GlobalText.TEXTS.model_password,
            isDisplayedInModal: true,
            isSettable: true,
            childrenObject: 'user',
            childrenFieldName: 'password',
        }),
        shopName: new TextModelField({
            title: GlobalText.TEXTS.model_distribution_name,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        shopType: new TextModelField({
            title: GlobalText.TEXTS.model_type_shop,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        addressStreet: new TextModelField({
            isDisplayedInTable: true,
            title: GlobalText.TEXTS.add_beneficiary_getAddressStreet,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        addressNumber: new TextModelField({
            isDisplayedInTable: true,
            title:  GlobalText.TEXTS.add_beneficiary_getAddressNumber,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        addressPostcode: new TextModelField({
            isDisplayedInTable: true,
            title: GlobalText.TEXTS.add_beneficiary_getAddressPostcode,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        location: new ObjectModelField<Location>({
            isDisplayedInTable: true,
            displayTableFunction: null,
            title: GlobalText.TEXTS.location,

        }),
        adm1: new NestedFieldModelField({
            title: GlobalText.TEXTS.adm1,
            isDisplayedInModal: true,
            isSettable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm1',
            isTrigger: true,
            triggerFunction: (vendor: Vendor, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                vendor.set('adm2', null);
                vendor.set('adm3', null);
                vendor.set('adm4', null);
                appInjector.get(LocationService).fillAdm2Options(vendor, parseInt(value, 10)).subscribe();
                return vendor;
            },
        }),
        adm2: new NestedFieldModelField({
            title: GlobalText.TEXTS.adm2,
            isDisplayedInModal: true,
            isSettable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm2',
            isTrigger: true,
            triggerFunction: (vendor: Vendor, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                vendor.set('adm3', null);
                vendor.set('adm4', null);
                appInjector.get(LocationService).fillAdm3Options(vendor, parseInt(value, 10)).subscribe();
                return vendor;
            },
        }),
        adm3: new NestedFieldModelField({
            title: GlobalText.TEXTS.adm3,
            isDisplayedInModal: true,
            isSettable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm3',
            isTrigger: true,
            triggerFunction: (vendor: Vendor, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                vendor.set('adm4', null);
                appInjector.get(LocationService).fillAdm4Options(vendor, parseInt(value, 10)).subscribe();
                return vendor;
            },
        }),
        adm4: new NestedFieldModelField({
            title: GlobalText.TEXTS.adm4,
            isDisplayedInModal: true,
            isSettable: true,
            childrenObject: 'location',
            childrenFieldName: 'adm4',
        }),
    };

    public static apiToModel(vendorFromApi: any): Vendor {
        const newVendor = new Vendor();
        newVendor.set('user', User.apiToModel(vendorFromApi.user));
        newVendor.set('shopName', vendorFromApi.name);
        newVendor.set('shopType', vendorFromApi.shop);
        newVendor.set('addressStreet', vendorFromApi.address_street);
        newVendor.set('addressNumber', vendorFromApi.address_number);
        newVendor.set('addressPostcode', vendorFromApi.address_postcode);
        newVendor.set('location', vendorFromApi.location ? Location.apiToModel(vendorFromApi.location) : null);
        newVendor.fields.location.displayTableFunction = (value: Location) => value ? value.getLocationName() : null;

        return newVendor;
    }

    public modelToApi(): Object {
        return {
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

}
