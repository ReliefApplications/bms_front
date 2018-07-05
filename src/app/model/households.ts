import { SectorMapper        } from "./sector-mapper";

export class Households {
    static __classname__ = 'Donor';
    /**
     * Households' id
     * @type {number}
     */
    id: number;
    /**
     * Households' familyName
     * @type {string}
     */
    familyName: string = '';
    /**
     * Households' firstName
     * @type {string}
     */
    firstName: string = '';
    /**
     * Households' location
     * @type {string}
     */
    location: string = '';
        /**
     * Households' dependents
     * @type {Int16Array}
     */
    dependents: Int16Array;
     /**
     * Households' vulnerabilities
     * @type {string}
     */
    vulnerabilities: string = '';


    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.familyName = instance.familyName;
            this.firstName = instance.firstName;
            this.location = instance.location;
            this.dependents = instance.dependents;
            this.vulnerabilities = instance.vulnerabilities;
        }
    }

    /**
    * return a Households after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;
    
        return {
            familyName: selfinstance.familyName,
            firstName: selfinstance.firstName,
            location: selfinstance.location,
            dependents: selfinstance.dependents,
            vulnerabilities: selfinstance.vulnerabilities,
        }
    }

    /**
    * return a Households after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            familyName: selfinstance.familyName,
            firstName: selfinstance.firstName,
            location: selfinstance.location,
            dependents: selfinstance.dependents,
            vulnerabilities: selfinstance.vulnerabilities,
        } 
    }

    /**
    * return the type of Households properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            familyName : "text",
            firstName : "text",
            location : "text",
            dependents : "number",
            vulnerabilities : "png"
        }
    }

    /**
    * return Households properties name displayed
    */
    static translator(): Object {
        return {
            familyName: "Family name",
            firstName: "First name",
            location: "Location",
            dependents : "Dependents",
            vulnerabilities : "Vulnerabilities"
        }
    }
}