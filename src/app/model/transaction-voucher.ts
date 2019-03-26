import { GlobalText } from '../../texts/global';
import { Booklet } from './booklet';
export class TransactionVoucher {
    static __classname__ = 'TransactionVoucher';

    /**
     * Beneficiary id
     * @type {number}
     */
    beneficiaryId: number;

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
            this.beneficiaryId = instance.beneficiaryId;
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
            value: GlobalText.TEXTS.model_value,
        };
    }

    public static getBookletTotalValue(booklet): number {
        let value = 0;
        booklet.vouchers.forEach(voucher => {
            value += voucher.value;
        });
        return value;
    }

    public static formatArray(instance: any, commodities: any): TransactionVoucher[] {
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
        transactionVoucher.givenName = instance.beneficiary ? instance.beneficiary.given_name : null;
        transactionVoucher.familyName = instance.beneficiary ? instance.beneficiary.family_name : null;
        transactionVoucher.beneficiaryId = instance.beneficiary ? instance.beneficiary.id : null;
        transactionVoucher.booklet = null;
        if (instance.booklets.length) {
            instance.booklets.forEach(booklet => {
                // try to find a non-deactivated booklet
                if (booklet.status !== 3) {
                    transactionVoucher.booklet = booklet;
                }
            });
            // if we didn't find one
            if (transactionVoucher.booklet === null) {
                transactionVoucher.booklet = instance.booklets[0];
            }
        }
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
            booklet: selfInstance.booklet ? selfInstance.booklet.code : null,
            status: selfInstance.booklet ? Booklet.__status__[selfInstance.booklet.status] : null,
            used: selfInstance.booklet ? this.getBookletUsed(selfInstance.booklet) : null,
            value: selfInstance.booklet ?
                TransactionVoucher.getBookletTotalValue(selfInstance.booklet) + ' ' + selfInstance.booklet.currency : null,
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
            booklet: selfInstance.booklet ? selfInstance.booklet.code : null,
            status: selfInstance.booklet ? Booklet.__status__[selfInstance.booklet.status] : null,
            used: selfInstance.booklet ? this.getBookletUsed(selfInstance.booklet) : null,
            value: selfInstance.booklet ?
                TransactionVoucher.getBookletTotalValue(selfInstance.booklet) + ' ' + selfInstance.booklet.currency : null,
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
            booklet: selfInstance.booklet ? selfInstance.booklet.code : null,
            status: selfInstance.booklet ? Booklet.__status__[selfInstance.booklet.status] : null,
            used: selfInstance.booklet ? this.getBookletUsed(selfInstance.booklet) : null,
            value: selfInstance.booklet ?
                TransactionVoucher.getBookletTotalValue(selfInstance.booklet) + ' ' + selfInstance.booklet.currency : null,
        };
    }

     /**
    * return a DistributionData after formatting its properties for the modal update
    */
   getMapperUpdate(selfInstance: TransactionVoucher): object {
    if (!selfInstance) {
        return selfInstance;
    }

    return {
        givenName: selfInstance.givenName,
        familyName: selfInstance.familyName,
        booklet: selfInstance.booklet ? selfInstance.booklet.code : null,
        status: selfInstance.booklet ? Booklet.__status__[selfInstance.booklet.status] : null,
        used: selfInstance.booklet ? this.getBookletUsed(selfInstance.booklet) : null,
        value: selfInstance.booklet ?
            TransactionVoucher.getBookletTotalValue(selfInstance.booklet) + ' ' + selfInstance.booklet.currency : null,
    };
}

    /**
    * return the type of Beneficiary properties
    */
   getTypeProperties(selfinstance: TransactionVoucher) {
        return {
            givenName: 'text',
            familyName: 'text',
            status: 'number',
            booklet: 'text',
            used: 'date',
            value: 'text'
        };
    }

    /**
    * return the type of Beneficiary properties
    */
    getModalTypeProperties(selfinstance: TransactionVoucher) {
        return {
            givenName: 'text',
            familyName: 'text',
            status: 'number',
            booklet: 'text',
            used: 'date',
            value: 'text'
        };
    }

    getBookletUsed(booklet): Date {
        let date = null;
        if (booklet.status === 2 || booklet.status === 3) {
            booklet.vouchers.forEach(voucher => {
                if (date === null || date < voucher.used_at) {
                    date = voucher.used_at;
                }
            });
        }

        return date;
    }
}
