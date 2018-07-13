export class Households {
    static __classname__ = 'Households';
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
     * @type {Number}
     */
    dependents: Number;
     /**
     * Households' vulnerabilities
     * @type {Array}
     */
    vulnerabilities: Array<string> = [];


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
            vulnerabilities : "png",
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
            vulnerabilities : "Vulnerabilities",
        }
    }

    public static formatArray(instance): Households[]{
        let households : Households[] = [];
        instance.forEach(element => {
            households.push(this.formatElement(element));
        });
        return households;
    }

    public static formatElement(element: any): Households {
        let household = new Households();
        let dependents = 0;
        household.id = element.id;
        element.beneficiaries.forEach(beneficiary => {
                household.familyName = beneficiary.family_name;
                household.firstName = beneficiary.given_name;
                beneficiary.vulnerability_criteria.forEach(vulnerability => {
                    household.vulnerabilities.push(vulnerability);
                });
                
        });
           
        household.location = element.location.adm4 + " " + element.location.adm3 + " " +
                             element.location.adm2 + " " +  element.location.adm1 + " "  ;
        household.dependents = dependents;
        

        return household;
    }
}