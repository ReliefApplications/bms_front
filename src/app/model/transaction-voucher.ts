import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';
import { isNull } from 'util';
import { GeneralRelief } from 'src/app/model/general-relief';

export class TransactionVoucher {
    static __classname__ = 'TransactionVoucher';

    /**
     * Voucher id.
     */
    id: number;

    /**
     * Voucher givenName
     * @type {string}
     */
    givenName: string;

    /**
     * Voucher familyName
     * @type {string}
     */
    familyName: string;

    /**
     * Voucher Date of use
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
            this.used = instance.used;
            this.values = instance.values;
            this.id_transaction = instance.id_transaction;
            this.notes = instance.note;
        }
    }


    public static getDisplayedName() {
        // return GlobalText.TEXTS.beneficiary;
        // TODO Wait merge to recover the value in the other branch
        return 'Voucher';
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

    public static formatArray(instance: any, commodityList?: any[]): TransactionVoucher[] {
        const voucher: TransactionVoucher[] = [];

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
                    voucher.push(this.formatElement(element, commodities));
                }
            );
        } else {
            return null;
        }

        return (voucher);
    }

    public static formatElement(instance: any, com: string): TransactionVoucher {
        const voucher = new TransactionVoucher();

        voucher.id = instance.beneficiary.id;
        voucher.givenName = instance.beneficiary.given_name;
        voucher.familyName = instance.beneficiary.family_name;
        voucher.used = instance.general_reliefs[0].distributed_at ? instance.general_reliefs[0].distributed_at : undefined;
        voucher.values = com;
        voucher.notes = instance.notes;
        voucher.generalReliefs = instance.general_reliefs;

        if (instance.transactions && instance.transactions.length > 0) {
            voucher.id_transaction = instance.transactions[0].id;
        }

        return (voucher);
    }

    public static formatForApi(instance: any) {

        const voucher = {
            id: instance.id,
            givenName: instance.givenName,
            familyName: instance.familyName,
            used: instance.used,
            values: instance.values,
            notes: instance.notes,
        };

        return (voucher);
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            used: selfinstance.generalReliefs ? selfinstance.generalReliefs[0].distributed_at : undefined,
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
            used: selfinstance.generalReliefs ? selfinstance.generalReliefs[0].distributed_at : undefined,
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

        return {
            id_transaction: selfinstance.id_transaction,
            givenName: selfinstance.givenName,
            familyName: selfinstance.familyName,
            used: selfinstance.generalReliefs ? selfinstance.generalReliefs[0].distributed_at : undefined,
            values: selfinstance.values,
            notes: selfinstance.generalReliefs ? selfinstance.generalReliefs[0].notes : '',
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
            notes: selfinstance.notes,
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            id_transaction: 'text',
            givenName: 'text',
            familyName: 'text',
            used: 'date',
            values: 'text',
            notes: 'text',
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            id_transaction: 'text',
            givenName: 'text',
            familyName: 'text',
            used: 'date',
            values: 'text',
            notes: 'text',
        };
    }
}
