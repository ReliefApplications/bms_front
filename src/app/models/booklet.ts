import { FormGroup } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { Beneficiary } from './beneficiary';
import { CURRENCIES } from './constants/currencies';
import { CustomModel } from './custom-models/custom-model';
import { DateModelField } from './custom-models/date-model-field';
import { MultipleObjectsModelField } from './custom-models/multiple-object-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { Distribution } from './distribution';
import { Voucher } from './voucher';
import { BooleanModelField } from './custom-models/boolan-model-field';
import { AppInjector } from '../app-injector';
import { FormService } from '../core/utils/form.service';
import { DatePipe } from '@angular/common';

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

    title = this.language.vouchers_booklet;
    matSortActive = 'code';
    createMultiple = true;

    public fields = {
        id: new NumberModelField(
            {
              // Never displayed
            },
        ),
        code: new TextModelField({
            title: this.language.booklet_code,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),
        numberOfBooklets: new NumberModelField({
            title: this.language.booklet_number_booklets,
            value: 1,
            isDisplayedInModal: true,
            isSettable: true,
        }),
        numberOfVouchers: new NumberModelField({
            title: this.language.booklet_number_vouchers,
            value: 1,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
        }),
        individualValues: new TextModelField({
            title: this.language.booklet_individual_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            isRequired: true,
            hint: this.language.modal_values_format_error,
            patternError: this.language.modal_values_format_error,
            pattern: /^([\d]+,?\s?,?\s?)+$/,
        }),
        currency: new SingleSelectModelField({
            title: this.language.currency,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            bindField: 'name',
            apiLabel: 'id',
            options: CURRENCIES.map(currency => new Currency(currency.id, currency.name)),
            isEditable: true,
            isSettable: true,
            isRequired: true,
        }),
        status: new SingleSelectModelField({
            title: this.language.status,
            options: [
                new BookletStatus('0', this.language.booklet_unassigned),
                new BookletStatus('1', this.language.distributed),
                new BookletStatus('2', this.language.booklet_used),
                new BookletStatus('3', this.language.booklet_deactivated),
            ],
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            bindField: 'name',
            apiLabel: 'id',
            value: new BookletStatus('0', 'Unassigned'),
        }),
        definePassword: new BooleanModelField({
            title: this.language.booklet_define_password,
            isTrigger: true,
            isDisplayedInModal: true,
            isSettable: true,
            isEditable: true,
            value: false,
            triggerFunction: (booklet: Booklet, value: boolean, form: FormGroup) => {
                booklet.fields.password.isDisplayedInModal = value;
                return booklet;
            },
        }),
        password: new TextModelField({
            title: this.language.password,
            isDisplayedInModal: false,
            isEditable: true,
            isSettable: true,
            isPassword: true,
            pattern: /^(\d{4})$/,
            patternError: this.language.booklet_password_pattern,
            hint: this.language.booklet_password_pattern
        }),
        beneficiary: new ObjectModelField<Beneficiary>({
            title: this.language.beneficiary,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            displayTableFunction: null,
            displayModalFunction: null,
        }),
        distribution: new ObjectModelField<Distribution>({
            title: this.language.distribution,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            displayTableFunction: null,
            displayModalFunction: null,
        }),
        vouchers: new MultipleObjectsModelField<Voucher>({

        }),
        value: new NumberModelField({
            title: this.language.value,
            displayValue: ''
        }),
        usedAt: new TextModelField({
            title: this.language.booklet_used,
            nullValue: this.language.null_not_yet
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
        newBooklet.fields.value.displayValue = newBooklet.getTotalValue() + ' ' + newBooklet.get('currency').get('name');

        // No need to format the date, it is a voucher's date so already formatted
        newBooklet.set('usedAt',  newBooklet.getUsedAt());

        newBooklet.fields.beneficiary.displayTableFunction = (value: Beneficiary) => value ? value.get('localFullName') : null;
        newBooklet.fields.beneficiary.displayModalFunction = (value: Beneficiary) => value ? value.get('localFullName') : null;
        newBooklet.fields.distribution.displayTableFunction = (value: Distribution) => value ? value.get('name') : null;
        newBooklet.fields.distribution.displayModalFunction = (value: Distribution) => value ? value.get('name') : null;

        if (bookletFromApi.password) {
            newBooklet.fields.definePassword.title = newBooklet.language.booklet_update_password;
        }

        const formService = AppInjector.get(FormService);
        const localCurrency = formService.getLocalCurrency();
        const currencies = formService.pushLocalCurrencyOnTop(CURRENCIES, localCurrency);
        newBooklet.setOptions('currency', currencies.map(currency => new Currency(currency.id, currency.name)));

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
            code: this.get('code'),
            status: this.get('status') ? this.get('status').get('id') : null,
            vouchers: this.get('vouchers') ? this.get<Array<Voucher>>('vouchers').map((voucher: Voucher) => voucher.modelToApi()) : null
        };
    }

    isPrintable() {
        return true;
    }

    isCheckable() {
        return parseInt(this.get('status').get<string>('id'), 10) < 2;
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
        let text = null;
        let numberUsed = 0;
        let total = 0;
        if (this.get('status').get<string>('id') === '2' || this.get('status').get<string>('id') === '3') {
            this.get<Voucher[]>('vouchers').forEach((voucher: Voucher) => {
                if (date === null || date < voucher.get('usedAt')) {
                    date = voucher.get('usedAt');
                }
                numberUsed += 1;
                total += 1;
            });
            const datePipe = new DatePipe('en-US');
            text = numberUsed + '/' + total + ' (' + datePipe.transform(date, 'dd-MM-yyyy') + ')';
        } else {
            this.get<Voucher[]>('vouchers').forEach((voucher: Voucher) => {
                total += 1;
                if (voucher.get('usedAt')) {
                    numberUsed += 1;
                }
            });
            text = numberUsed + '/' + total;
        }

        return text;
    }
}
