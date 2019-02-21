import { GlobalText } from '../../texts/global';

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
     * Beneficiary residency_status
     * @type {string}
     */
    residency_status: string;

    /**
     * Beneficiary status
     * @type {boolean}
     */
    status: boolean;

    /**
     * Beneficiary national_ids
     * @type {Array}
     */
    national_ids: Array<string> = [];

    /**
     * Beneficiary phones
     * @type {Array}
     */
    phones: Array<string> = [];

    /**
     * Beneficiary vulnerabilities
     * @type {Array}
     */
    vulnerabilities: Array<string> = [];

    /**
     * Beneficiary's full_name
     * @type {string}
     */
    full_name: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.given_name = instance.given_name;
            this.family_name = instance.family_name;
            this.gender = instance.gender;
            this.date_of_birth = instance.date_of_birth;
            this.residency_status = instance.residency_status;
            this.status = instance.status;
            this.national_ids = instance.national_ids;
            this.phones = instance.phones;
            this.vulnerabilities = instance.vulnerabilities;
            this.full_name = instance.full_name;
        }
    }


    public static getDisplayedName() {
        return GlobalText.TEXTS.beneficiary;
    }


    /**
    * return Households properties name displayed
    */
   static translator(): Object {
    return {
        given_name : GlobalText.TEXTS.model_firstName,
        family_name : GlobalText.TEXTS.model_familyName,
        gender : GlobalText.TEXTS.gender,
        date_of_birth : GlobalText.TEXTS.model_dateofbirth,
        residency_status : GlobalText.TEXTS.model_residencystatus,
        status : GlobalText.TEXTS.model_beneficiaries_status,
        national_ids : GlobalText.TEXTS.model_beneficiaries_nationalids,
        phones : GlobalText.TEXTS.model_beneficiaries_phones,
        vulnerabilities : GlobalText.TEXTS.model_vulnerabilities,
    };
}

public static mapVulnerability(name: string): string {
    if (!name) {
        return '';
    }
    switch (name) {
        case 'pregnant':
            name = 'assets/images/households/pregnant.png';
            break;
        case 'disabled':
            name = 'assets/images/households/disabled.png';
            break;
        case 'lactating':
            name = 'assets/images/households/lactating.png';
            break;
        case 'solo parent':
            name = 'assets/images/households/solo-parent.png';
            break;
        case 'nutritional issues':
            name = 'assets/images/households/nutritional-issues.png';
            break;
        default: return name;
    }
    return name;
}

public static formatArray(instance: any): Beneficiaries[] {
    const beneficiaries: Beneficiaries[] = [];
    if (instance) {
        instance.forEach(element => {
            if (element.beneficiary) {
                beneficiaries.push(this.formatElement(element.beneficiary));
            } else {
                beneficiaries.push(this.formatElement(element));
            }
        });
    } else {
        return null;
    }
    return(beneficiaries);
}

public static formatElement(instance: any): Beneficiaries {
    const beneficiary = new Beneficiaries();

    beneficiary.given_name = instance.given_name;
    beneficiary.family_name = instance.family_name;
    beneficiary.gender = instance.gender;
    beneficiary.date_of_birth = instance.date_of_birth;
    beneficiary.residency_status = instance.residency_status;
    beneficiary.status = instance.status;
    beneficiary.id = instance.id;

    beneficiary.full_name = instance.given_name + ' ' + instance.family_name;

    beneficiary.national_ids = [];
    beneficiary.phones = [];
    beneficiary.vulnerabilities = [];

    if (instance.national_ids) {
        instance.national_ids.forEach(
            element => {
                beneficiary.national_ids.push(element.id_number);
            }
        );
    }
    if (instance.phones) {
        instance.phones.forEach(
            element => {
                beneficiary.phones.push(element.number);
            }
        );
    }
    if (instance.vulnerability_criteria) {
        instance.vulnerability_criteria.forEach(
            element => {
                beneficiary.vulnerabilities.push(this.mapVulnerability(element.field_string));
            }
        );
    }
    return(beneficiary);
}

public static formatForApi(instance: any) {
    let vulnerability_criteria_copy = new Array();
    let phones_copy = new Array();
    let national_ids_copy = new Array();

    vulnerability_criteria_copy = instance.vulnerabilities;
    phones_copy = instance.phones;
    national_ids_copy = instance.national_ids;

    const beneficiary = {
        given_name : instance.given_name,
        family_name : instance.family_name,
        gender : instance.gender,
        date_of_birth : instance.date_of_birth,
        residency_status : instance.residency_status,
        status : instance.status,
        vulnerability_criteria : vulnerability_criteria_copy,
        phones : phones_copy,
        national_ids : national_ids_copy,
        id: instance.id
    };

    return(beneficiary);
}

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            id : selfinstance.id,
            given_name : selfinstance.given_name,
            family_name : selfinstance.family_name,
            gender : selfinstance.gender,
            date_of_birth : selfinstance.date_of_birth,
            residency_status : selfinstance.residency_status,
            status : selfinstance.status,
            national_ids : Object.assign({}, selfinstance.national_ids),
            phones : Object.assign({}, selfinstance.phones),
            vulnerabilities : Object.assign({}, selfinstance.vulnerabilities),
        };
    }

    /**
    * return a Beneficiary after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        let stringGender;
        if (selfinstance.gender === 0) {
            stringGender = 'Female';
        } else if (selfinstance.gender === 1) {
            stringGender = 'Male';
        } else {
            stringGender = 'Other';
        }

        return {
            given_name : selfinstance.given_name,
            family_name : selfinstance.family_name,
            gender : stringGender,
            date_of_birth : selfinstance.date_of_birth,
            residency_status : selfinstance.residency_status,
            // status : selfinstance.status,
            // national_ids : selfinstance.national_ids,
            // phones : selfinstance.phones,
            vulnerabilities : selfinstance.vulnerabilities,
        };
    }

    /**
    * return a Beneficiary after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }
        let vulnerabilityString = '';
        if (selfinstance.vulnerabilities[0]) {
            selfinstance.vulnerabilities.forEach(
                (element, index) => {
                    if (index > 0) {
                        vulnerabilityString += ', ';
                    }
                    vulnerabilityString += element.substring(25).split('.')[0];
                }
            );
        }

        return {
            given_name : selfinstance.given_name,
            family_name : selfinstance.family_name,
            gender : selfinstance.gender,
            date_of_birth : selfinstance.date_of_birth,
            residency_status : selfinstance.residency_status,
            status : selfinstance.status,
            national_ids : selfinstance.national_ids,
            phones : selfinstance.phones,
            vulnerabilities : vulnerabilityString,
        };
    }

    /**
    * return a DistributionData after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            given_name : selfinstance.given_name,
            family_name : selfinstance.family_name,
            gender : selfinstance.gender,
            date_of_birth : selfinstance.date_of_birth,
            residency_status : selfinstance.residency_status,
            status : selfinstance.status,
            national_ids : selfinstance.national_ids,
            phones : selfinstance.phones,
            vulnerabilities : selfinstance.vulnerabilities,
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            given_name : 'text',
            family_name : 'text',
            gender : 'text',
            date_of_birth : 'date',
            residency_status : 'text',
            status : 'number',
            national_ids : 'text',
            phones : 'text',
            vulnerabilities : 'png',
        };
    }

    /**
    * return the type of Beneficiary properties for modal
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            given_name : 'text',
            family_name : 'text',
            gender : 'number',
            date_of_birth : 'date',
            residency_status : 'text',
            status : 'number',
            national_ids : 'text',
            phones : 'text',
            vulnerabilities : 'png',
        };
    }



}
