import { GlobalText } from '../../texts/global';
import { User } from './user';

export class ErrorInterface {
    message: string;
}

export class Vendors {
    static __classname__ = 'Vendors';
    /**
     * Vendors id
     * @type {string}
     */
    id = '';
    /**
     * Name of the shop
     * @type {string}
     */
    name = '';
    /**
     * Type of the shop
     * @type {string}
     */
    shop = '';
    /**
     * Households' address_street
     * @type {string}
     */
    address_street = '';
    /**
    * Households' address_number
    * @type {string}
    */
    address_number = '';
    /**
     * Households' address_postcode
     * @type {string}
     */
    address_postcode = '';
    // /**
    //  * Address of the shop
    //  * @type {string}
    //  */
    // address = '';
    /**
     * Username
     * @type {string}
     */
    username = '';
    /**
     * Password
     * @type {string}
     */
    password = '';
    /**
     * User (the user password is the vendor salted password)
     * @type {User}
     */
    user: User;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
            this.shop = instance.shop;
            this.address_number = instance.address_number;
            this.address_postcode = instance.address_postcode;
            this.address_street = instance.address_street;
            this.user = instance.user ? instance.user : null;
            this.password = instance.password;
        }
    }

    /**
    * return User properties name displayed
    */
    static translator(): Object {
        return {
            name: GlobalText.TEXTS.model_distribution_name,
            shop: GlobalText.TEXTS.model_type_shop,
            address_number: GlobalText.TEXTS.add_beneficiary_getAddressNumber,
            address_street: GlobalText.TEXTS.add_beneficiary_getAddressStreet,
            address_postcode: GlobalText.TEXTS.add_beneficiary_getAddressPostcode,
            username: GlobalText.TEXTS.login_username,
            password: GlobalText.TEXTS.model_password,
        };
    }

    public static formatArray(instance): Vendors[] {
        const vendors: Vendors[] = [];
        if (instance) {
            instance.forEach(element => {
                vendors.push(this.formatFromApi(element));
            });
        }
        return vendors;
    }

    public static formatFromApi(element: any): Vendors {
        const vendor = new Vendors(element);

        if (element.password) {
          vendor.password = '';
          vendor.user.password = element.password;
        }

        return vendor;
      }

    public static formatForApi(element: Vendors): any {
        return {
            id: element.id,
            name: element.name,
            shop: element.shop,
            address_street: element.address_street,
            address_number: element.address_number,
            address_postcode: element.address_postcode,
            username: element.user && element.user.username ? element.user.username : element.username,
            password: element.user && element.user.password ? element.user.password : element.password,
        };
    }

    /**
   * used in modal add
   * @param element
   * @param loadedData
   */
    public static formatFromModalAdd(element: any, loadedData: any): Vendors {
        return new Vendors(element);
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.settings_vendors;
    }

    /**
    * return the type of vendors properties
    */
    getTypeProperties(): Object {
        return {
            name: 'text',
            shop: 'text',
            address_street: 'text',
            address_number: 'number',
            address_postcode: 'text',
            username: 'text',
            password: 'password',
        };
    }

    /**
    * return a vendors after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }
        return {
            name: selfinstance.name,
            shop: selfinstance.shop,
            address_street: selfinstance.address_street,
            address_number: selfinstance.address_number,
            address_postcode: selfinstance.address_postcode,
            username: selfinstance.user ? selfinstance.user.username : null,
        };
    }

    /**
    * return a vendors after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            name: selfinstance.name,
            shop: selfinstance.shop,
            address_street: selfinstance.address_street,
            address_number: selfinstance.address_number,
            address_postcode: selfinstance.address_postcode,
            username: selfinstance.user ? selfinstance.user.username : null,
        };
    }


    /**
     * return a User after formatting its properties for the modal update
     */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }
        return {
            name: selfinstance.name,
            shop: selfinstance.shop,
            address_street: selfinstance.address_street,
            address_number: selfinstance.address_number,
            address_postcode: selfinstance.address_postcode,
            username: selfinstance.user ? selfinstance.user.username : null,
            password: selfinstance.password,
        };
    }

    /**
   * return a User after formatting its properties for the modal add
   */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            name: selfinstance.name,
            shop: selfinstance.shop,
            address_street: selfinstance.address_street,
            address_number: selfinstance.address_number,
            address_postcode: selfinstance.address_postcode,
            username: selfinstance.user ? selfinstance.user.username : null,
            password: selfinstance.password,
        };
    }

    /**
    * return the type of User properties for modals
    */
    getModalTypeProperties(): Object {
        return {
            name: 'text',
            shop: 'text',
            address_street: 'text',
            address_number: 'number',
            address_postcode: 'text',
            username: 'text',
            password: 'password',
        };
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }
        return {
            id: selfinstance.id,
            name: selfinstance.name,
            shop: selfinstance.shop,
            address_street: selfinstance.address_street,
            address_number: selfinstance.address_number,
            address_postcode: selfinstance.address_postcode,
            username: selfinstance.user ? selfinstance.user.username : null,
            salted_password: selfinstance.user ? selfinstance.user.password : null,
        };
    }
}
