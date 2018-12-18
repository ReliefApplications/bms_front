import { GlobalText } from "../../texts/global";

export class ErrorInterface {
    message: string;
}

export class Wing {
    static __classname__ = 'Wing';
    /**
     * Wing id
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
            username: GlobalText.TEXTS.email,
            password: GlobalText.TEXTS.model_user_password,
        }
    }

    public static formatArray(instance): Wing[] {
        let wing: Wing[] = [];
        if (instance)
            instance.forEach(element => {
                wing.push(this.formatFromApi(element));
            });

        return wing;
    }

    public static formatFromApi(element: any): Wing {
        let wing = new Wing(element);

        if (element.password) {
            wing.password = '';
            wing.salted_password = element.password;
        }

        return wing;
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
   * return a Wing after formatting its properties
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

    public static formatForApi(element: Wing): any {
        return new Wing(element);
    }
}