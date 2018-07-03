export class ErrorInterface{
    message : string;
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
    rights:string;
    /**
     * loggedIn state
     * @type {boolean}
     */
    loggedIn: boolean = false;
    
    voters: any = {};

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.username = instance.username;
            this.email = instance.email;
            this.salted_password = instance.salted_password;
            this.rights = instance.rights;
        }
    }

    /**
    * return a UserInterface after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;
    
        return {
            username : selfinstance.username,
            email : selfinstance.email,
            rights : selfinstance.rights
        }
    }

    /**
    * return a UserInterface after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            username : selfinstance.username,
            email : selfinstance.email,
            rights : selfinstance.rights
        } 
    }

    /**
    * return the type of UserInterface properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            username : "text",
            email : "text",
            rights : "text"
        }
    }

    /**
    * return UserInterface properties name displayed
    */
    static translator(): Object {
        return {
            username : "Username",
            email : "Email",
            rights : "Rights"
        }
    }

    public static formatArray(instance): UserInterface[]{
        let users : UserInterface[] = [];
        instance.forEach(element => {
            users.push(this.formatDonor(element));
        });
        return users;
    }

    public static formatDonor(element: any): UserInterface{
        let user = new UserInterface();
        user.id = element.id;
        user.email = element.email;
        user.username = element.username;
        element.roles.forEach(element => {
            user.rights = " "+element+" ";
        });
        return user;
    }
}
