import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';
import { isNull } from 'util';

export class Booklet {
    static __classname__ = 'Booklet';

    /**
     * Booklet id.
     */
    id: number;

    /**
     * Booklet code
     * @type {string}
     */
    code: string;

    /**
     * Booklet number of vouchers
     * @type {number}
     */
    number_vouchers: number;

    /**
     * Booklet individual value.
     * @type {number}
     */
    individual_value: number;

    /**
     * Booklet currency
     * @type {string}
     */
    currency: string;

    /**
     * Booklet status
     * @type {number}
     */
    status: number;

    /**
     * Booklet password.
     * @type {string}
     */
    password: string;

    /**
     * Booklet distribution beneficiary's ID
     * @type {number}
     */
    distribution_beneficiary: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.code = instance.code;
            this.number_vouchers = instance.number_vouchers;
            this.individual_value = instance.individual_value;
            this.currency = instance.currency;
            this.status = instance.status;
            this.password = instance.password;
            this.distribution_beneficiary = instance.distribution_beneficiary;
        }
    }


    public static getDisplayedName() {
        return GlobalText.TEXTS.model_booklet;
    }


    /**
    * return Voucher properties name displayed
    */
    static translator(): Object {
        return {
            code: GlobalText.TEXTS.model_code,
            number_vouchers: GlobalText.TEXTS.model_number_vouchers,
            individual_value: GlobalText.TEXTS.model_individual_value,
            currency: GlobalText.TEXTS.model_currency,
            status: GlobalText.TEXTS.model_state,
            password: GlobalText.TEXTS.model_password,
            distribution_beneficiary: GlobalText.TEXTS.model_distribution_beneficiary,
        };
    }

    public static formatArray(instance: any): Booklet[] {
        const booklets: Booklet[] = [];

        if (instance) {
            instance.forEach(
                element => {
                    booklets.push(this.formatElement(element));
                }
            );
        } else {
            return null;
        }

        return (booklets);
    }

    public static formatElement(instance: any): Booklet {
        const booklet = new Booklet();

        booklet.id = instance.id;
        booklet.code = instance.code;
        booklet.number_vouchers = instance.number_vouchers;
        booklet.individual_value = instance.individual_value;
        booklet.currency = instance.currency;
        booklet.status = instance.status;
        booklet.password = instance.password;
        booklet.distribution_beneficiary = instance.distribution_beneficiary;

        return (booklet);
    }

    public static formatForApi(instance: any) {

        const booklet = {
            id: instance.id,
            code: instance.code,
            number_vouchers: instance.number_vouchers,
            individual_value: instance.individual_value,
            currency: instance.currency,
            status: instance.status,
            password: instance.password,
            distribution_beneficiary: instance.distribution_beneficiary,
        };

        return (booklet);
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            code: selfinstance.code,
            number_vouchers: selfinstance.number_vouchers,
            individual_value: selfinstance.individual_value,
            currency: selfinstance.currency,
            status: selfinstance.status,
            password: selfinstance.password,
        };
    }

    /**
    * return a Booklet after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            code: selfinstance.code,
            number_vouchers: selfinstance.number_vouchers,
            individual_value: selfinstance.individual_value,
            currency: selfinstance.currency,
            status: selfinstance.status,
        };
    }

    /**
    * return a Booklet after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            code: selfinstance.code,
            number_vouchers: selfinstance.number_vouchers,
            individual_value: selfinstance.individual_value,
            currency: selfinstance.currency,
            status: selfinstance.status,
            password: selfinstance.password,
            distribution_beneficiary: selfinstance.distribution_beneficiary,
        };
    }

    /**
    * return a Booklet after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            code: selfinstance.code,
            number_vouchers: selfinstance.number_vouchers,
            individual_value: selfinstance.individual_value,
            currency: selfinstance.currency,
            status: selfinstance.status,
        };
    }

    /**
    * return the type of Booklet properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            code: 'text',
            number_vouchers: 'number',
            individual_value: 'number',
            currency: 'text',
            status: 'number',
            password: 'text',
        };
    }

    /**
    * return the type of Booklet properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            code: 'text',
            number_vouchers: 'number',
            individual_value: 'number',
            currency: 'text',
            status: 'number',
            password: 'text',
        };
    }
}
