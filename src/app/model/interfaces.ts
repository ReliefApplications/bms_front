import { GlobalText } from "../../texts/global";

export class ErrorInterface {
    message: string;
}

export class UserInterface {
    static __classname__ = 'UserInterface';
    /**
     * User id
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
    /**
     * Email
     * @type {string}
     */
    email: string = '';
    /**
    * User's rights
    * @type {string}
    */
    rights: string;
    /**
     * loggedIn state
     * @type {boolean}
     */
    loggedIn: boolean = false;

    voters: any = {};

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.username = instance.username;
            this.email = instance.email;
            this.salted_password = instance.salted_password;
            this.rights = instance.rights;
        }
    }

    public static getDisplayedName(){
        return GlobalText.TEXTS.model_user;
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            id: selfinstance.id,
            username: selfinstance.username,
            email: selfinstance.email,
            salted_password: selfinstance.salted_password,
            rights: selfinstance.rights,
        }
    }

    /**
    * return a UserInterface after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            username: selfinstance.username,
            rights: selfinstance.rights
        }
    }

    /**
    * return a UserInterface after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            username: selfinstance.username,
            rights: selfinstance.rights
        }
    }

    /**
     * return a UserInterface after formatting its properties for the modal add
     */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            username: selfinstance.username,
            rights: selfinstance.rights
        }
    }

    /**
     * return a UserInterface after formatting its properties for the modal update
     */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            rights: selfinstance.rights
        }
    }

    /**
    * return the type of UserInterface properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            username: "text",
            rights: "text"
        }
    }

    /**
    * return the type of UserInterface properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            username: "email",
            rights: "selectSingle"
        }
    }

    /**
    * return UserInterface properties name displayed
    */
    static translator(): Object {
        return {
            username: GlobalText.TEXTS.model_user_username,
            rights: GlobalText.TEXTS.model_user_rights
        }
    }

    public static formatArray(instance): UserInterface[] {
        let users: UserInterface[] = [];
        instance.forEach(element => {
            users.push(this.formatFromApi(element));
        });
        return users;
    }

    public static formatFromApi(element: any): UserInterface {
        let user = new UserInterface(element);
        if (element.roles) {
            element.roles.forEach(element => {
                user.rights = " " + element + " ";
            });
        }
        return user;
    }

    /**
     * used in modal add
     * @param element 
     * @param loadedData 
     */
    public static formatFromModalAdd(element: any, loadedData: any): UserInterface {
        let newObject = new UserInterface(element);

        return newObject;
    }

    public static formatForApi(element: UserInterface): any {
        return new UserInterface(element);
    }
}
