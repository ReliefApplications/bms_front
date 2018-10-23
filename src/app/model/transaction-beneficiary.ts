import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';

export class TransactionBeneficiary {
    static __classname__ = 'TransactionBeneficiary';

    /**
     * Beneficiary id.
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
     * Phone number of beneficiary.
     */
    phone: string;

    /**
     * Status : -2. not sent / -1. no phone / 0. fail to send / 1.Successfully sent / 2. already sent
     */
    state: number;

    /**
     * Values(ammount of money) for each beneficiary (from commodities)
     */
    values: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.givenName = instance.givenName;
            this.familyName = instance.familyName;
            this.phone = instance.phone;
            this.state = instance.state ? instance.state : -2;
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
            givenName: GlobalText.TEXTS.model_beneficiaries_firstName,
            familyName: GlobalText.TEXTS.model_beneficiaries_familyName,
            phone: GlobalText.TEXTS.add_beneficiary_getPhone,
            state: GlobalText.TEXTS.model_beneficiaries_state,
            values: GlobalText.TEXTS.model_beneficiaries_values,
        };
    }

    public static formatArray(instance: any, commodityList?: any[]): TransactionBeneficiary[] {
        const beneficiaries: TransactionBeneficiary[] = [];

        // console.log('before format : ', instance);

        let commodities = '';
        if (commodityList) {
            commodityList.forEach(
                (commodity, index) => {
                    if (index > 0) {
                        commodities += ', ';
                    }
                    commodities += commodity.value + ' ' + commodity.unit;
                }
            )
        }

        instance.forEach(
            element => {
                beneficiaries.push(this.formatElement(element, commodities));
            }
        );

        // console.log('after format : ', beneficiaries);

        return (beneficiaries);
    }

    public static formatElement(instance: any, com: string): TransactionBeneficiary {
        const beneficiary = new TransactionBeneficiary();

        beneficiary.id = instance.beneficiary.id;
        beneficiary.givenName = instance.beneficiary.given_name;
        beneficiary.familyName = instance.beneficiary.family_name;
        beneficiary.phone = instance.beneficiary.phones[0] ? instance.beneficiary.phones[0].number : undefined;

        if( isNumber(instance.transaction.transaction_status) ) {
            switch(instance.transaction.transaction_status) {
                case 0: 
                    beneficiary.updateState('Sending failed');
                    break;
                case 1: 
                    beneficiary.updateState('Already sent');
                    break;
                case 2: 
                    beneficiary.updateState('No phone');
                    break;
                default : 
                    beneficiary.updateState('Not sent');
                    break;
            }
        } else {
            beneficiary.updateState('Not sent');
        }
        beneficiary.values = com;

        return (beneficiary);
    }

    public static formatForApi(instance: any) {

        const beneficiary = {
            id: instance.id,
            givenName: instance.givenName,
            familyName: instance.familyName,
            phone: instance.phone
        };

        return (beneficiary);
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            phone: selfinstance.phone,
            state: selfinstance.state,
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
        switch (selfinstance.state) {
            case -2:
                stateString = 'Not sent';
                break;
            case -1:
                stateString = 'No phone';
                break;
            case 0:
                stateString = 'Sending failed';
                break;
            case 1:
                stateString = 'Sent';
                break;
            case 2:
                stateString = 'Already sent';
                break;
            default:
                stateString = 'Not sent';
                break;
        }

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            phone: selfinstance.phone ? selfinstance.phone : 'none',
            state: stateString,
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
        switch (selfinstance.state) {
            case -2:
                stateString = 'Not sent';
                break;
            case -1:
                stateString = 'No phone';
                break;
            case 0:
                stateString = 'Sending failed';
                break;
            case 1:
                stateString = 'Sent';
                break;
            case 2:
                stateString = 'Already sent';
                break;
            default:
                stateString = 'Not sent';
                break;
        }

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            phone: selfinstance.phone ? selfinstance.phone : 'none',
            state: stateString,
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
            number: selfinstance.number
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            givenName: 'text',
            familyName: 'text',
            phone: 'text',
            state: 'text',
            values: 'text',
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            givenName: 'text',
            familyName: 'text',
            phone: 'text',
            state: 'text',
            values: 'text',
        };
    }

    updateState(state: string) {
        let stateNumber;

        switch(state) {
            case 'Not sent': 
                stateNumber = -2;
                break;
            case 'No phone':
                stateNumber = -1;
                break;
            case 'Sending failed':
                stateNumber = 0;
                break;
            case 'Sent':
                stateNumber = 1;
                break;
            case 'Already sent':
                stateNumber = 2;
                break;
            default:
                stateNumber = -2;
                break;
        }

        this.state = stateNumber;
    }

}
