import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';
import { isNull } from 'util';
import { GeneralRelief } from 'src/app/model/general-relief';

export class TransactionGeneralRelief {
    static __classname__ = 'TransactionGeneralRelief';

    /**
     * General Relief id.
     */
    id: number;

    /**
     * General Relief givenName
     * @type {string}
     */
    givenName: string;

    /**
     * General Relief familyName
     * @type {string}
     */
    familyName: string;

    /**
     * General Relief Date of use
     */
    used: Date;

    /**
     * Values(ammount of money) for each beneficiary (from commodities)
     */
    values: string;

    /**
     * General relief
     */
    generalReliefs: GeneralRelief[];

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.givenName = instance.givenName;
            this.familyName = instance.familyName;
            this.used = instance.used;
            this.values = instance.values;
        }
    }


    public static getDisplayedName() {
        // return GlobalText.TEXTS.beneficiary;
        // TODO Wait merge to recover the value in the other branch
        return 'General Relief';
    }


    /**
    * return Households properties name displayed
    */
    static translator(): Object {
        return {
            givenName: GlobalText.TEXTS.model_firstName,
            familyName: GlobalText.TEXTS.model_familyName,
            used: GlobalText.TEXTS.model_used,
            values: GlobalText.TEXTS.model_value,
            notes: GlobalText.TEXTS.model_notes,
        };
    }

    public static formatArray(instance: any, commodityList?: any[]): TransactionGeneralRelief[] {
        const generalRelief: TransactionGeneralRelief[] = [];

        let commodities = '';
        if (commodityList) {
            commodityList.forEach(
                (commodity, index) => {
                    if (index > 0) {
                        commodities += ', ';
                    }
                    commodities += commodity.value + ' ' + commodity.unit;
                }
            );
        }

        if (instance) {
            instance.forEach(
                element => {
                    generalRelief.push(this.formatElement(element, commodities));
                }
            );
        } else {
            return null;
        }

        console.log('Format Array: ', generalRelief);

        return generalRelief;
    }

    public static formatElement(instance: any, com: string): TransactionGeneralRelief {
        const generalRelief = new TransactionGeneralRelief();

        generalRelief.id = instance.beneficiary.id;
        generalRelief.givenName = instance.beneficiary.given_name;
        generalRelief.familyName = instance.beneficiary.family_name;
        generalRelief.used = instance.general_reliefs[0].distributed_at ? instance.general_reliefs[0].distributed_at : undefined;
        generalRelief.values = com;
        generalRelief.generalReliefs = instance.general_reliefs;

        console.log('Format Element: ', generalRelief);

        return generalRelief;
    }

    public static formatForApi(instance: any) {

        const generalRelief = {
            id: instance.id,
            givenName: instance.givenName,
            familyName: instance.familyName,
            used: instance.used,
            values: instance.values,
        };

        console.log('Format for API: ', generalRelief);

        return generalRelief;
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        console.log('mapAllProperties: ', selfinstance);

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            used: selfinstance.used,
            values: selfinstance.values,
            generalReliefs: selfinstance.generalReliefs
        };
    }

    /**
    * return a Beneficiary after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            used: selfinstance.used,
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

        if (selfinstance.generalReliefs) {
            const notes = selfinstance.generalReliefs.map(generalRelief => {
                return generalRelief.notes;
            });
        }

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            used: selfinstance.used,
            values: selfinstance.values,
            notes: notes,
        };
    }

    /**
    * return a DistributionData after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        if (selfinstance.generalReliefs) {
            const notes = selfinstance.generalReliefs.map(generalRelief => {
                return generalRelief.notes;
            });
        }

        return {
            notes: notes,
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            givenName: 'text',
            familyName: 'text',
            used: 'date',
            values: 'text',
            notes: 'array',
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            givenName: 'text',
            familyName: 'text',
            used: 'date',
            values: 'text',
            notes: 'array',
        };
    }
}
