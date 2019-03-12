import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';
import { isNull } from 'util';
import * as CryptoJS from 'crypto-js';

export class Booklet {
    static __classname__ = 'Booklet';
    static __status__ = {
        0: 'Unassigned',
        1: 'Distributed',
        2: 'Used',
        3: 'Deactivated'
    };

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
     * Array of voucher's individual values.
     * @type {number[]}
     */
    individual_values: number[];

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

    /**
     * Booklet set individual for all
     * @type {boolean}
     */
    individual_to_all: boolean;

    /**
     * Booklet number of booklets to create
     * @type {number}
     */
    number_booklets: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.code = instance.code;
            this.number_vouchers = instance.number_vouchers;
            this.individual_value = instance.individual_value;
            this.individual_values = instance.individual_values;
            this.currency = instance.currency;
            this.status = instance.status;
            this.password = instance.password;
            this.distribution_beneficiary = instance.distribution_beneficiary;
            this.individual_to_all = instance.individual_to_all;
            this.number_booklets = instance.number_booklets;
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
            individual_values: GlobalText.TEXTS.model_individual_value,
            currency: GlobalText.TEXTS.model_currency,
            status: GlobalText.TEXTS.model_state,
            password: GlobalText.TEXTS.model_password,
            distribution_beneficiary: GlobalText.TEXTS.model_distribution_beneficiary,
            individual_to_all: GlobalText.TEXTS.model_individual_to_all,
            number_booklets: GlobalText.TEXTS.model_number_booklets,
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
        const booklet = new Booklet(instance);

        booklet.individual_values = [];
        booklet.individual_to_all = false;
        instance.vouchers.forEach(voucher => {
            booklet.individual_values.push(voucher.value);
        });
        const unique = booklet.individual_values.filter((value, index, array) => array.indexOf(value) === index);
        if (unique.length > 1) {
            booklet.individual_to_all = true;
            booklet.individual_value = null;
        } else {
            booklet.individual_value = instance.vouchers.length > 0 ? instance.vouchers[0].value : null;
        }
        return booklet;
    }

    public static formatForApi(instance: any) {
        instance.password = instance.password ? CryptoJS.SHA1(instance.password).toString(CryptoJS.enc.Base64) : null;
        if (instance.individual_value) {
            instance.individual_values = new Array(instance.number_vouchers);
            instance.individual_values.fill(instance.individual_value);
        }
        return new Booklet(instance);
    }

    /**
     * used in modal add
     * @param element
     * @param loadedData
     */
    public static formatFromModalAdd(element: any, loadedData: any): Booklet {
        return this.formatForApi(element);
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            id: selfinstance.id,
            code: selfinstance.code,
            number_vouchers: selfinstance.number_vouchers,
            individual_to_all: selfinstance.individual_to_all ? selfinstance.individual_to_all : false,
            individual_value: selfinstance.individual_value,
            individual_values: selfinstance.individual_values,
            currency: selfinstance.currency,
            status: selfinstance.status,
            distribution_beneficiary: selfinstance.distribution_beneficiary ? selfinstance.distribution_beneficiary.id : null,
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
            individual_value: selfinstance.individual_values ?
                this.formatValues(selfinstance.individual_values) :
                selfinstance.individual_value,
            currency: selfinstance.currency,
            status: Booklet.__status__[selfinstance.status],
        };
    }

    /**
    * return a Booklet after formatting its properties for the modal add
    */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            number_booklets: selfinstance.number_booklets ? selfinstance.number_booklets : 1,
            number_vouchers: selfinstance.number_vouchers ? selfinstance.number_vouchers : 1,
            individual_to_all: selfinstance.individual_to_all ? selfinstance.individual_to_all : false,
            individual_value: selfinstance.individual_value,
            individual_values: selfinstance.individual_values,
            currency: selfinstance.currency,
            password: selfinstance.password
        };
    }

    /**
    * return a Booklet after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        let distribution_beneficiary;
        if (selfinstance.distribution_beneficiary) {
            distribution_beneficiary = selfinstance.distribution_beneficiary.id;
        } else {
            distribution_beneficiary = selfinstance.distribution_beneficiary;
        }

        return {
            code: selfinstance.code,
            number_vouchers: selfinstance.number_vouchers,
            individual_value: selfinstance.individual_values ?
                this.formatValues(selfinstance.individual_values) :
                selfinstance.individual_value,
            currency: selfinstance.currency,
            status: selfinstance.status,
            distribution_beneficiary: distribution_beneficiary,
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
            individual_to_all: selfinstance.individual_to_all ? selfinstance.individual_to_all : false,
            individual_value: selfinstance.individual_value,
            individual_values: selfinstance.individual_values,
            currency: selfinstance.currency,
            password: selfinstance.password
        };
    }

    /**
    * return the type of Booklet properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            code: 'text',
            number_vouchers: 'positive-number',
            individual_value: 'individual_value',
            individual_values: 'individual_values',
            currency: 'text',
            status: 'number',
            password: 'password',
            individual_to_all: 'checkbox',
        };
    }

    /**
    * return the type of Booklet properties
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            code: 'text',
            number_vouchers: 'positive-number',
            individual_value: 'individual_value',
            individual_values: 'individual_values',
            currency: 'text',
            status: 'number',
            password: 'password',
            individual_to_all: 'checkbox',
            number_booklets: 'positive-number'
        };
    }

    formatValues(values: Array<string>): string {
        let formattedValues = values[0];
        values.forEach((value, index) => {
            formattedValues = index !== 0 ? formattedValues + ', ' + value : formattedValues;
        });
        return formattedValues;
    }
}
