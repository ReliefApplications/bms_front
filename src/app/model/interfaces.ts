export class ErrorInterface{
    message : string;
}

export class UserInterface {
    /**
     * User id
     * @type {string}
     */
    user_id: string = '';
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
     * User's roles
     * @type {any}
     */
    role:string[] = [];
    /**
     * loggedIn state
     * @type {boolean}
     */
    loggedIn: boolean = false;
    
    voters: any = {};
}
