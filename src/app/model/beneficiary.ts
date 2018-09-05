import { GlobalText } from "../../texts/global";

export class Beneficiaries {
    static __classname__ = 'Beneficiaries';

    /**
     * Beneficiary id
     * @type {number}
     */
    id: number;

    /**
     * Beneficiary given_name
     * @type {string}
     */
    given_name: string;

    /**
     * Beneficiary family_name
     * @type {string}
     */
    family_name: string;

    /**
     * Beneficiary gender
     * @type {string}
     */
    gender: string;

    /**
     * Beneficiary date_of_birth
     * @type {Date}
     */
    date_of_birth: Date;

    /**
     * Beneficiary status
     * @type {boolean}
     */
    status: boolean;

    /**
     * Beneficiary national_ids
     * @type {Array}
     */
    national_ids: Array<number> = [];

    /**
     * Beneficiary phones
     * @type {Array}
     */
    phones: Array<number> = [];

    /**
     * Beneficiary vulnerabilities
     * @type {Array}
     */
    vulnerabilities: Array<string> = [];


    constructor(instance?) {
        if(instance !== undefined)
        {
            this.id = instance.id;
            this.given_name = instance.given_name;
            this.family_name = instance.family_name;
            this.gender = instance.gender;
            this.date_of_birth = instance.date_of_birth;
            this.status = instance.status;
            this.national_ids = instance.national_ids;
            this.phones = instance.phones;
            this.vulnerabilities = instance.vulnerabilities;
        }
    }


    public static getDisplayedName() {
        return GlobalText.TEXTS.model_criteria_beneficiary;
    }

    /**
    * return a Beneficiary after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            given_name : selfinstance.given_name,
            family_name : selfinstance.family_name,
            gender : selfinstance.gender,
            date_of_birth : selfinstance.date_of_birth,
            status : selfinstance.status,
            national_ids : selfinstance.national_ids,
            phones : selfinstance.phones,
            vulnerabilities : selfinstance.vulnerabilities,
        }
    }

    /**
    * return a Beneficiary after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            given_name : selfinstance.given_name,
            family_name : selfinstance.family_name,
            gender : selfinstance.gender,
            date_of_birth : selfinstance.date_of_birth,
            status : selfinstance.status,
            national_ids : selfinstance.national_ids,
            phones : selfinstance.phones,
            vulnerabilities : selfinstance.vulnerabilities,
        }
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            given_name : "text",
            family_name : "text",
            gender : "text",
            date_of_birth : "date",
            status : "number",
            national_ids : "number",
            phones : "number",
            vulnerabilities : "png",
        }
    }

    /**
    * return Households properties name displayed
    */
    static translator(): Object {
        return {
            given_name : GlobalText.TEXTS.model_beneficiaries_firstName,
            family_name : GlobalText.TEXTS.model_beneficiaries_familyName,
            gender : GlobalText.TEXTS.model_beneficiaries_gender,
            date_of_birth : GlobalText.TEXTS.model_beneficiaries_dateofbirth,
            status : GlobalText.TEXTS.model_beneficiaries_status,
            national_ids : GlobalText.TEXTS.model_beneficiaries_nationalids,
            phones : GlobalText.TEXTS.model_beneficiaries_phones,
            vulnerabilities : GlobalText.TEXTS.model_beneficiaries_vulnerabilities,
        }
    }

    public static mapVulnerability(name: string): string {
        if (!name) {
            return "";
        }
        switch (name) {
            case "pregnant":
                name = 'assets/images/households/pregnant.png';
                break;
            case "disabled":
                name = 'assets/images/households/disabled.png';
                break;
            case "lactating":
                name = 'assets/images/households/lactating.png';
                break;
            case "solo parent":
                name = 'assets/images/households/solo-parent.png';
                break;
            case "nutritional issues":
                name = 'assets/images/households/nutritional-issues.png';
                break;
            default: return name;
        }
        return name;
    }

    public static formatArray(instance : any): Beneficiaries[] {
        let beneficiaries : Beneficiaries[] = [];
        console.log("before format : ", instance);
        instance.forEach(element => {
            beneficiaries.push(this.formatElement(element));
        })
        console.log("after format : ", beneficiaries);
        return(beneficiaries);
    }

    public static formatElement(instance : any) : Beneficiaries{
        let beneficiary = new Beneficiaries();
        
        beneficiary.given_name = instance.given_name;
        beneficiary.family_name = instance.family_name;
        beneficiary.gender = instance.family_name;
        beneficiary.date_of_birth = instance.date_of_birth;
        beneficiary.status = instance.status;

        instance.national_ids.forEach(
            element => {
                beneficiary.national_ids.push(element);
            }
        )
        instance.phones.forEach(
            element => {
                beneficiary.phones.push(element);
            }
        )
        instance.vulnerability_criteria.forEach(
            element => {
                beneficiary.vulnerabilities.push(element);
            }
        )

        return(beneficiary);
    }


}