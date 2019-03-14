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
     * Transaction id.
     */
    id_transaction: number;

    /**
     * Voucher notes
     */
    notes: string;

    /**
     * General relief
     */
    generalReliefs: GeneralRelief[];

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.givenName = instance.givenName;
            this.familyName = instance.familyName;
            this.used = instance.general_reliefs[0] ? instance.general_reliefs[0].distributed_at : undefined;
            this.values = instance.values;
            this.id_transaction = instance.id_transaction;
            this.notes = instance.note;
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
            id_transaction: GlobalText.TEXTS.transaction_id_transaction,
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

        return generalRelief;
    }

    public static formatElement(instance: any, com: string): TransactionGeneralRelief {
        const generalRelief = new TransactionGeneralRelief();

        generalRelief.id = instance.beneficiary.id;
        generalRelief.givenName = instance.beneficiary.given_name;
        generalRelief.familyName = instance.beneficiary.family_name;
        generalRelief.used = instance.general_reliefs[0] ? instance.general_reliefs[0].distributed_at : undefined;
        generalRelief.values = com;
        generalRelief.notes = instance.notes;
        generalRelief.generalReliefs = instance.general_reliefs;
        if (instance.transactions && instance.transactions.length > 0) {
            generalRelief.id_transaction = instance.transactions[0].id;
        }
        return generalRelief;
    }

    public static formatForApi(instance: any) {

        const generalRelief = {
            id: instance.id,
            givenName: instance.givenName,
            familyName: instance.familyName,
            used: instance.used,
            values: instance.values,
            notes: instance.notes,
        };

        return generalRelief;
    }

    mapAllProperties(selfInstance: TransactionGeneralRelief): object {
        if (!selfInstance) {
            return selfInstance;
        }

        return {
            id: selfInstance.id,
            givenName: selfInstance.givenName,
            familyName: selfInstance.familyName,
            used: selfInstance.used,
            values: selfInstance.values,
            generalReliefs: selfInstance.generalReliefs
        };
    }

    /**
    * return a Beneficiary after formatting its properties
    */
    getMapper(selfInstance: TransactionGeneralRelief): object {
        if (!selfInstance) {
            return selfInstance;
        }

        return {
            givenName: selfInstance.givenName,
            familyName: selfInstance.familyName,
            used: selfInstance.generalReliefs ? selfInstance.generalReliefs[0].distributedAt : undefined,
            values: selfInstance.values,
        };
    }

    /**
    * return a Beneficiary after formatting its properties for the modal details
    */
    getMapperDetails(selfInstance: TransactionGeneralRelief) {
        if (!selfInstance) {
            return selfInstance;
        }

        let notes = [];
        if (selfInstance.generalReliefs) {
            notes = selfInstance.generalReliefs
            .map((generalRelief: GeneralRelief) => {
                return generalRelief.notes;
            })
            .filter((note: string) => note);
        }

        return {
            id_transaction: selfInstance.id_transaction,

            givenName: selfInstance.givenName,
            familyName: selfInstance.familyName,
            used: selfInstance.generalReliefs ? selfInstance.generalReliefs[0].distributedAt : undefined,
            values: selfInstance.values,
            notes: notes.join(' / '),
        };
    }

    /**
    * return a DistributionData after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance: TransactionGeneralRelief): object {
        if (!selfinstance) {
            return selfinstance;
        }

        let notes = [];
        if (selfinstance.generalReliefs) {
            notes = selfinstance.generalReliefs.map(generalRelief => {
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
    getTypeProperties(selfinstance: TransactionGeneralRelief) {
        return {
            id_transaction: 'text',
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
    getModalTypeProperties(selfinstance: TransactionGeneralRelief) {
        return {
            id_transaction: 'text',
            givenName: 'text',
            familyName: 'text',
            used: 'date',
            values: 'text',
            notes: 'array',
        };
    }
}
