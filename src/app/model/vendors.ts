import { GlobalText } from "../../texts/global";

export class ErrorInterface {
    message: string;
}

export class Vendors {
    static __classname__ = 'Vendors';
    /**
     * Vendors id
     * @type {string}
     */
    id: string = '';
    /**
     * Name of the shop
     * @type {string}
     */
    name: string = '';
    /**
     * Type of the shop
     * @type {string}
     */
    shop: string = '';
    /**
     * Address of the shop
     * @type {string}
     */
    address: string = '';
    /**
     * Username
     * @type {string}
     */
    username: string = '';
    /**
     * Password
     * @type {string}
     */
    password: string = '';

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
            this.shop = instance.shop;
            this.address = instance.address;
            this.username = instance.username;
            this.password = instance.password;
        }
    }

    /**
    * return User properties name displayed
    */
    static translator(): Object {
        console.log("test");
        return {
            name: GlobalText.TEXTS.model_distribution_name,
            shop: GlobalText.TEXTS.model_type,
            address: GlobalText.TEXTS.model_vendors_address,
            username: GlobalText.TEXTS.login_username,
            password: GlobalText.TEXTS.model_user_password,
        };
    }

    public static formatArray(instance): Vendors[] {
        let vendors: Vendors[] = [];
        if (instance)
            instance.forEach(element => {
                vendors.push(this.formatFromApi(element));
            });

        return vendors;
    }

    public static formatFromApi(element: any): Vendors {
        let vendors = new Vendors(element);

        return vendors;
    }

    /**
    * return the type of vendors properties
    */
    getTypeProperties(): Object {
        return {
            name: "text",
            shop: "text",
            address: "text",
            username: "text",
            password: "password",
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
            address: selfinstance.address,
            username: selfinstance.username,
            password: selfinstance.password,
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
            address: selfinstance.address,
            username: selfinstance.username,
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
            address: selfinstance.address,
            username: selfinstance.username,
            password: selfinstance.password,
        };
    }

    /**
    * return the type of User properties for modals
    */
    getModalTypeProperties(): Object {
        return {
            name: "text",
            shop: "text",
            address: "text",
            username: "text",
            password: "password",
        };
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }
        return {
            name: selfinstance.name,
            shop: selfinstance.shop,
            address: selfinstance.address,
            username: selfinstance.username,
        };
    }

    public static formatForApi(element: Vendors): any {
        return new Vendors(element);
    }
}