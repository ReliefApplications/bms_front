import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';
import { isNull } from 'util';

export class Voucher {
    static __classname__ = 'Voucher';

    /**
     * Voucher id.
     */
    id: number;

    /**
     * Voucher Booklet
     * @type {string}
     */
    booklet: string;

    /**
     * Voucher Vendor
     * @type {string}
     */
    vendor: string;

    /**
     * Voucher used.
     * @type {boolean}
     */
    used: boolean;

    /**
     * Voucher code
     * @type {string}
     */
    code: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.booklet = instance.booklet;
            this.vendor = instance.vendor;
            this.used = instance.used;
            this.code = instance.code;
        }
    }


    public static getDisplayedName() {
        return GlobalText.TEXTS.voucher;
    }


    /**
    * return Voucher properties name displayed
    */
    static translator(): Object {
        return {
            booklet: GlobalText.TEXTS.model_booklet,
            vendor: GlobalText.TEXTS.model_vendor,
            used: GlobalText.TEXTS.model_used,
            code: GlobalText.TEXTS.model_code,
        };
    }

    public static formatArray(instance: any): Voucher[] {
        const vouchers: Voucher[] = [];

        if (instance) {
            instance.forEach(
                element => {
                    vouchers.push(this.formatElement(element));
                }
            );
        } else {
            return null;
        }

        return (vouchers);
    }

    public static formatElement(instance: any): Voucher {
        const voucher = new Voucher();

        voucher.id = instance.id;
        voucher.booklet = instance.booklet;
        voucher.vendor = instance.vendor;
        voucher.used = instance.used;
        voucher.code = instance.code;

        return (voucher);
    }

    public static formatForApi(instance: any) {

        const voucher = {
            id: instance.id,
            booklet: instance.booklet,
            vendor: instance.vendor,
            used: instance.used,
            code: instance.code,
        };

        return (voucher);
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            booklet: selfinstance.booklet,
            vendor: selfinstance.vendor,
            used: selfinstance.used,
            code: selfinstance.code,
        };
    }

    /**
    * return a Voucher after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            booklet: selfinstance.booklet,
            vendor: selfinstance.vendor,
            used: selfinstance.used,
            code: selfinstance.code,
        };
    }

    /**
    * return a Voucher after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            booklet: selfinstance.booklet,
            vendor: selfinstance.vendor,
            used: selfinstance.used,
            code: selfinstance.code,
        };
    }

    /**
    * return a Voucher after formatting its properties for the modal update
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
    * return the type of Voucher properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            booklet: 'select',
            vendor: 'select',
            used: 'select',
            code: 'text',
        };
    }

    /**
    * return the type of Voucher properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            booklet: 'select',
            vendor: 'select',
            used: 'select',
            code: 'text',
        };
    }
}
