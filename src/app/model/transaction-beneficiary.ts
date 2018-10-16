import { GlobalText } from '../../texts/global';

export class TransactionBeneficiary {
    static __classname__ = 'TransactionBeneficiary';

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
     * Status : -1. not sent / 0. fail to send / 1.Successfully sent / 2. already sent
     */
    state: number;

    /**
     * Values for each beneficiary (from commodities)
     */
    values: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.givenName = instance.givenName;
            this.familyName = instance.familyName;
            this.state = instance.state? instance.state : -1;
            this.values = instance.values;
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
        state : GlobalText.TEXTS.model_beneficiaries_state,
        values: GlobalText.TEXTS.model_beneficiaries_values,
    };
}

public static formatArray(instance: any, commodityList?: any[]): TransactionBeneficiary[] {
    const beneficiaries: TransactionBeneficiary[] = [];
    console.log('before format : ', instance);
    instance.forEach(
        element => {
            let commodities = '';
            if(commodityList) {
                commodityList.forEach(
                    (commodity, index) => {
                        if(index>0) {
                            commodities += ', ';
                        }
                        commodities += commodity.value + ' ' + commodity.unit;
                    }
                )
            } 
            beneficiaries.push(this.formatElement(element, commodities));
        }
    );
    console.log('after format : ', beneficiaries);
    return(beneficiaries);
}

public static formatElement(instance: any, com: string): TransactionBeneficiary {
    const beneficiary = new TransactionBeneficiary();

    beneficiary.givenName = instance.given_name;
    beneficiary.familyName = instance.family_name;
    beneficiary.state = instance.state ? instance.state : -1;
    beneficiary.values = com;

    return(beneficiary);
}

public static formatForApi(instance: any) {

    const beneficiary = {
        givenName : instance.givenName,
        familyName : instance.familyName,
    };

    return(beneficiary);
}

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        let stateString;
        switch(selfinstance.state) {
            case -1:
                stateString = 'Not sent';
                break;
            case 0:
                stateString = 'Sending failed';                
                break;
            case 1:
                stateString = 'Sent';
                break;
            case 2:
                stateString = 'Already Sent';
                break;
            default:
                stateString = 'Not sent';
                break;
        }

        return {
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            state : stateString,
            values: selfinstance.values,
        };
    }

    /**
    * return a Beneficiary after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        let stateString;
        switch(selfinstance.state) {
            case -1:
                stateString = 'Not sent';
                break;
            case 0:
                stateString = 'Sending failed';                
                break;
            case 1:
                stateString = 'Sent';
                break;
            case 2:
                stateString = 'Already Sent';
                break;
            default:
                stateString = 'Not sent';
                break;
        }

        return {
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            state : stateString,
            values: selfinstance.values,
        };
    }

    /**
    * return a Beneficiary after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        let stateString;
        switch(selfinstance.state) {
            case undefined:
                stateString = 'Not sent';
                break;
            case 0:
                stateString = 'Sending failed';                
                break;
            case 1:
                stateString = 'Sent';
                break;
            case 2:
                stateString = 'Already Sent';
                break;
            default:
                stateString = 'Not sent';
        }

        return {
            givenName : selfinstance.givenName,
            familyName : selfinstance.familyName,
            state : selfinstance.state,
            values: selfinstance.values,
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
            state : selfinstance.state,
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            givenName : 'text',
            familyName : 'text',
            state : 'text',
            values: 'text',
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            givenName : 'text',
            familyName : 'text',
            state : 'text',
            values: 'text',
        };
    }



}
