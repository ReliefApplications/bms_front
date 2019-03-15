import { GlobalText } from '../../texts/global';
import { Booklet } from './booklet';
export class TransactionVoucher {
    static __classname__ = 'TransactionVoucher';

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
     * Beneficiary booklet
     * @type {Booklet}
     */
    booklet: Booklet;


    constructor(instance?) {
        if (instance !== undefined) {
            this.givenName = instance.givenName;
            this.familyName = instance.familyName;
            this.booklet = instance.booklet;
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
            givenName: GlobalText.TEXTS.model_firstName,
            familyName: GlobalText.TEXTS.model_familyName,
            booklet: GlobalText.TEXTS.model_booklet,
            status: GlobalText.TEXTS.model_state,
            used: GlobalText.TEXTS.model_used,
            value: GlobalText.TEXTS.model_booklet,
        };
    }

    public static formatArray(instance: any): TransactionVoucher[] {
        const transactionVouchers: TransactionVoucher[] = [];

        if (instance) {
            instance.forEach(
                element => {
                    transactionVouchers.push(this.formatElement(element));
                }
            );
        } else {
            return null;
        }

        return transactionVouchers;
    }

    public static formatElement(instance: any): TransactionVoucher {
        const transactionVoucher = new TransactionVoucher();

        transactionVoucher.givenName = instance.givenName;
        transactionVoucher.familyName = instance.familyName;
        transactionVoucher.booklet = instance.booklet;
        return transactionVoucher;
    }

    public static formatForApi(instance: any) {

        const transactionVoucher = {
            givenName: instance.givenName,
            familyName: instance.familyName,
            booklet: instance.booklet,
        };

        return transactionVoucher;
    }

    mapAllProperties(selfInstance: TransactionVoucher): object {
        if (!selfInstance) {
            return selfInstance;
        }

        return {
            givenName: selfInstance.givenName,
            familyName: selfInstance.familyName,
            booklet: selfInstance.booklet.code,
            status: selfInstance.booklet.status,
            used: selfInstance.booklet.status,
            value: '10' + selfInstance.booklet.currency,
        };
    }

    /**
    * return a Beneficiary after formatting its properties
    */
    getMapper(selfInstance: TransactionVoucher): object {
        if (!selfInstance) {
            return selfInstance;
        }

        return {
            givenName: selfInstance.givenName,
            familyName: selfInstance.familyName,
            booklet: selfInstance.booklet.code,
            status: selfInstance.booklet.status,
            used: selfInstance.booklet.status,
            value: '10' + selfInstance.booklet.currency,
        };
    }

    /**
    * return a Beneficiary after formatting its properties for the modal details
    */
    getMapperDetails(selfInstance: TransactionVoucher) {
        if (!selfInstance) {
            return selfInstance;
        }

        return {
            givenName: selfInstance.givenName,
            familyName: selfInstance.familyName,
            booklet: selfInstance.booklet.code,
            status: selfInstance.booklet.status,
            used: selfInstance.booklet.status,
            value: '10' + selfInstance.booklet.currency,
        };
    }
}
