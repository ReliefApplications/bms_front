import { GlobalText } from '../../texts/global';
import * as CryptoJS from 'crypto-js';
import { CustomModel } from './CustomModel/custom-model';
import { TextModelField } from './CustomModel/text-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { Beneficiary } from './beneficiary.new';
import { Distribution } from './distribution.new';
import { CURRENCIES } from './currencies';
import { Voucher } from './voucher.new';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { FormGroup, Validators, FormControl } from '@angular/forms';

export class BookletStatus extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class Currency extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class Booklet extends CustomModel {

    title = GlobalText.TEXTS.model_booklet;
    matSortActive = 'code';

    public fields = {
        id: new NumberModelField(
            {
              // Never displayed
            },
        ),
        code: new TextModelField({
            title: GlobalText.TEXTS.model_code,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),
        numberOfBooklets: new NumberModelField({
            title: GlobalText.TEXTS.model_number_booklets,
            value: 1,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        numberOfVouchers: new NumberModelField({
            title: GlobalText.TEXTS.model_number_vouchers,
            value: 1,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
        }),
        individualValues: new TextModelField({
            title: GlobalText.TEXTS.model_individual_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            isRequired: true,
            hint: GlobalText.TEXTS.modal_values_format_error,
            pattern: /^([\d]+,?\s?,?\s?)+$/,
        }),
        currency: new SingleSelectModelField({
            title: GlobalText.TEXTS.model_currency,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            bindField: 'name',
            options: CURRENCIES.map(currency => new Currency(currency.id, currency.name)),
            isEditable: true,
            isSettable: true,
            isRequired: true,
        }),
        status: new SingleSelectModelField({
            title: GlobalText.TEXTS.model_state,
            options: [
                new BookletStatus('0', GlobalText.TEXTS.model_unassigned),
                new BookletStatus('1', GlobalText.TEXTS.model_distributed),
                new BookletStatus('2', GlobalText.TEXTS.model_used),
                new BookletStatus('3', GlobalText.TEXTS.model_deactivated),
            ],
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            bindField: 'name',
            value: new BookletStatus('0', 'Unassigned'),
        }),
        definePassword: new BooleanModelField({
            title: 'Define a password',
            isTrigger: true,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            value: true,
            triggerFunction: (booklet: Booklet, value: boolean, form: FormGroup) => {
                booklet.fields.password.isDisplayedInModal = value;
                return booklet;
            },
        }),
        password: new TextModelField({
            title: GlobalText.TEXTS.model_password,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            isPassword: true,
            pattern: /^(\d{4})/,
        }),
        beneficiary: new ObjectModelField<Beneficiary>({
            title: GlobalText.TEXTS.beneficiary,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            displayTableFunction: null,
            displayModalFunction: null,
        }),
        distribution: new ObjectModelField<Distribution>({
            title: GlobalText.TEXTS.distribution,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            displayTableFunction: null,
            displayModalFunction: null,
        }),
        vouchers: new MultipleObjectsModelField<Voucher>({

        }),
        value: new NumberModelField({
            title: GlobalText.TEXTS.model_value,
        }),
        usedAt: new DateModelField({
            title: GlobalText.TEXTS.model_used,
            nullValue: 'Not yet'
        }),
    };

    public static apiToModel(bookletFromApi): Booklet {
        const newBooklet = new Booklet();

        newBooklet.set('id', bookletFromApi.id);
        newBooklet.set('code', bookletFromApi.code);
        newBooklet.set('numberOfVouchers', bookletFromApi.number_vouchers);
        newBooklet.set('currency',
            bookletFromApi.currency ?
            newBooklet.getOptions('currency')
                .filter((currency: Currency) => currency.get('name') === bookletFromApi.currency)[0] :
            null);
        const status = newBooklet.fields.status.options.filter((option: BookletStatus) => {
            return option.get('id') === bookletFromApi.status.toString();
        })[0];
        newBooklet.set('status', status ? status : null);

        const individualValues = [];
        newBooklet.set('vouchers', bookletFromApi.vouchers.map((voucher: any) => Voucher.apiToModel(voucher)));
        bookletFromApi.vouchers.forEach(voucher => {
            individualValues.push(voucher.value);
        });
        const unique = individualValues.filter((value, index, array) => array.indexOf(value) === index);
        if (unique.length > 1) {
            // newBooklet.set('individualToAll', true);
            let individualValuesString = '';
            individualValues.forEach((value) => individualValuesString += value + ', ');
            newBooklet.set('individualValues', individualValuesString);
        } else {
            // newBooklet.set('individualToAll', false);
            newBooklet.set('individualValues',
                bookletFromApi.vouchers.length > 0 && bookletFromApi.vouchers[0].value ?
                bookletFromApi.vouchers[0].value.toString() :
                null);
        }

        newBooklet.set('beneficiary',
            bookletFromApi.distribution_beneficiary ? Beneficiary.apiToModel(bookletFromApi.distribution_beneficiary.beneficiary) : null);
        newBooklet.set('distribution',
            bookletFromApi.distribution_beneficiary ?
            Distribution.apiToModel(bookletFromApi.distribution_beneficiary.distribution_data) :
            null);

        newBooklet.set('value', newBooklet.getTotalValue());
        newBooklet.set('usedAt', newBooklet.getUsedAt());

        newBooklet.fields.beneficiary.displayTableFunction = (value: Beneficiary) => value ? value.get('fullName') : null;
        newBooklet.fields.beneficiary.displayModalFunction = (value: Beneficiary) => value ? value.get('fullName') : null;
        newBooklet.fields.distribution.displayTableFunction = (value: Distribution) => value ? value.get('name') : null;
        newBooklet.fields.distribution.displayModalFunction = (value: Distribution) => value ? value.get('name') : null;

        if (bookletFromApi.password) {
            newBooklet.fields.definePassword.title = 'Update Password';
            newBooklet.set('definePassword', false);
            newBooklet.fields.password.isDisplayedInModal = false;
        }

        return newBooklet;
    }

    public modelToApi(): Object {

        const password = this.get('password') ? CryptoJS.SHA1(this.get('password')).toString(CryptoJS.enc.Base64) : null;

        let values = this.get<string>('individualValues').replace(/ /g, '').split(',');
        if (values.length === 0) {
            values = new Array(this.get<number>('numberOfVouchers'));
            values.fill('0');
        } else if (values.length < this.get<number>('numberOfVouchers')) {
            const lastValue = values.pop();
            while (values.length < this.get<number>('numberOfVouchers')) {
                values.push(lastValue);
            }
        } else if (values.length > this.get<number>('numberOfVouchers')) {
            while (values.length > this.get<number>('numberOfVouchers')) {
                values.pop();
            }
        }
        return {
            id: this.get('id'),
            password: password,
            individual_values: values,
            currency: this.get('currency').get('name'),
            // inidividual_to_all: this.get('individualToAll'),
            number_booklets: this.get('numberOfBooklets'),
            number_vouchers: this.get('numberOfVouchers'),
        };
    }

    isPrintable() {
        return true;
    }

    isCheckable() {
        return this.get('usedAt') === null;
    }

    public getTotalValue(): number {
        let value = 0;
        this.get<Voucher[]>('vouchers').forEach((voucher: Voucher) => {
            value += voucher.get<number>('value');
        });
        return value;
    }

    public getUsedAt(): Date {
        let date = null;
        if (this.get('status').get<string>('id') === '2' || this.get('status').get<string>('id') === '3') {
            this.get<Voucher[]>('vouchers').forEach((voucher: Voucher) => {
                if (date === null || date < voucher.get('usedAt')) {
                    date = voucher.get('usedAt');
                }
            });
        }

        return date;
    }
}
