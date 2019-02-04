import { GlobalText } from "../../texts/global";

export class ErrorInterface {
    message: string;
}

export class FinancialProvider {
    static __classname__ = 'Financial Provider';
    /**
     * FinancialProvider id
     * @type {string}
     */
    id: string = '';
    /**
     * Username
     * @type {string}
     */
    username: string = '';
    /**
     * Plain text password
     * @type {string}
     */
    password: string = '';
    /**
     * Salted password
     * @type {string}
     */
    salted_password: string = '';

    buttonInfo: Object = {icon: "settings/api", title: GlobalText.TEXTS.settings_financial_provider, ref:"financialProvider"};

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.username = instance.username;
            this.password = instance.password;
            this.salted_password = instance.salted_password;
        }
    }

    /**
    * return User properties name displayed
    */
    static translator(): Object {
        return {
            username: GlobalText.TEXTS.login_username,
            password: GlobalText.TEXTS.model_user_password,
        }
    }

    public static formatArray(instance): FinancialProvider[] {
        let financialProvider: FinancialProvider[] = [];
        if (instance)
            instance.forEach(element => {
                financialProvider.push(this.formatFromApi(element));
            });

        return financialProvider;
    }

    public static formatFromApi(element: any): FinancialProvider {
        let financialProvider = new FinancialProvider(element);

        if (element.password) {
            financialProvider.password = '';
            financialProvider.salted_password = element.password;
        }

        return financialProvider;
    }

    /**
    * return the type of User properties
    */
    getTypeProperties(): Object {
        return {
            username: "text",
        }
    }

    /**
    * return a User after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            username: selfinstance.username,
        }
    }

    /**
   * return a financial provider after formatting its properties
   */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            username: selfinstance.username,
        }
    }

    /**
     * return a User after formatting its properties for the modal update
     */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            username: selfinstance.username,
            password: selfinstance.password,
        }
    }

    /**
    * return the type of User properties for modals
    */
    getModalTypeProperties(): Object {
        return {
            username: "text",
            password: "password",
        }
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            id: selfinstance.id,
            username: selfinstance.username,
        }
    }

    public static formatForApi(element: FinancialProvider): any {
        return new FinancialProvider(element);
    }
}