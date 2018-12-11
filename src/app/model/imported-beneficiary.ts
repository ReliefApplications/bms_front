import { GlobalText } from '../../texts/global';

export class ImportedBeneficiary {
    static __classname__ = 'ImportedBeneficiary';

    /**
     * Id of the beneficiary (if not new)
     */
    id: number;
    /**
     * Beneficiary givenName
     * @type {string}
     */
    givenName: string;

    /**
     * Beneficiary familyName
     * @type {string}
     */
    familyName: string;

    /**
     * Beneficiary date of birth
     * @type {Date}
     */
    date_of_birth: Date;

    /**
     * Beneficiary gender
     * @type {string}
     */
    gender: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id ? instance.id : null;
            this.givenName = instance.givenName;
            this.familyName = instance.familyName;
            this.date_of_birth = instance.date_of_birth;
            this.gender = instance.gender;
        }
    }


    public static getDisplayedName() {
        return GlobalText.TEXTS.model_criteria_beneficiary;
    }


    /**
    * return Households properties name displayed
    */
   static translator(): Object {
    return {
        givenName : GlobalText.TEXTS.model_beneficiaries_firstName,
        familyName : GlobalText.TEXTS.model_beneficiaries_familyName,
        date_of_birth : GlobalText.TEXTS.model_beneficiaries_dateofbirth,
        gender : GlobalText.TEXTS.add_beneficiary_getGender,
    };
}

public static formatArray(instance: any): ImportedBeneficiary[] {
    const beneficiaries: ImportedBeneficiary[] = [];
    if(instance)
    instance.forEach(element => {
        beneficiaries.push(this.formatElement(element));
    });
    return(beneficiaries);
}

public static formatElement(instance: any): ImportedBeneficiary {
    const beneficiary = new ImportedBeneficiary();

    beneficiary.id = instance.id ? instance.id : null;
    beneficiary.givenName = instance.given_name ? instance.given_name : instance.givenName;
    beneficiary.familyName = instance.family_name ? instance.family_name : instance.familyName;
    beneficiary.date_of_birth = instance.date_of_birth ? instance.date_of_birth : instance.dateOfBirth;
    beneficiary.gender = instance.gender;

    return(beneficiary);
}

public static formatForApi(instance: any) {

    const beneficiary = {
        id : instance.id,
        givenName : instance.givenName,
        familyName : instance.familyName,
        date_of_birth : instance.date_of_birth,
        gender : instance.gender,
    };

    return(beneficiary);
}

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            date_of_birth : selfinstance.date_of_birth,
            gender : selfinstance.gender,
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
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            date_of_birth : selfinstance.date_of_birth,
            gender : stringGender,
        };
    }

    /**
    * return a Beneficiary after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            date_of_birth : selfinstance.date_of_birth,
            gender : selfinstance.gender,
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
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            date_of_birth : selfinstance.date_of_birth,
            gender : selfinstance.gender,
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            givenName : 'text',
            familyName : 'text',
            date_of_birth : 'date',
            gender : 'text',
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            givenName : 'text',
            familyName : 'text',
            date_of_birth : 'date',
            gender : 'number',
        };
    }



}
