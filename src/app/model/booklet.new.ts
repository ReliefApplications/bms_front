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
import { NestedFieldModelField } from './CustomModel/nested-field';

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
        numberOfVouchers: new NumberModelField({
            title: GlobalText.TEXTS.model_number_vouchers,
            value: 1,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),
        individualValues: new TextModelField({
            title: GlobalText.TEXTS.model_individual_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),
        currency: new SingleSelectModelField({
            title: GlobalText.TEXTS.model_currency,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            bindField: 'name',
            options: [],
        }),
        status: new SingleSelectModelField({
            title: GlobalText.TEXTS.model_state,
            options: [
                new BookletStatus('0', 'Unassigned'),
                new BookletStatus('1', 'Distributed'),
                new BookletStatus('2', 'Used'),
                new BookletStatus('3', 'Deactivated'),
            ],
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            bindField: 'name'
        }),
        password: new TextModelField({
            title: GlobalText.TEXTS.model_password,

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
        individualToAll: new BooleanModelField({
            title: GlobalText.TEXTS.model_individual_to_all,
            value: false,
        }),
        numberOfBooklets: new NumberModelField({
            title: GlobalText.TEXTS.model_number_booklets,
            value: 1

        })
    };

    public static apiToModel(bookletFromApi): Booklet {
        const newBooklet = new Booklet();

        newBooklet.set('id', bookletFromApi.id);
        newBooklet.set('code', bookletFromApi.code);
        newBooklet.set('numberOfVouchers', bookletFromApi.number_vouchers);
        newBooklet.set('currency', new Currency(null, bookletFromApi.currency));
        const status = newBooklet.fields.status.options.filter((option: BookletStatus) => {
            return option.get('id') === bookletFromApi.status.toString();
        })[0];
        newBooklet.set('status', status ? status : null);

        const individualValues = [];
        bookletFromApi.vouchers.forEach(voucher => {
            individualValues.push(voucher.value);
        });
        const unique = individualValues.filter((value, index, array) => array.indexOf(value) === index);
        if (unique.length > 1) {
            newBooklet.set('individualToAll', true);
            let individualValuesString = '';
            individualValues.forEach((value) => individualValuesString += value + ', ');
            newBooklet.set('individualValues', individualValuesString);
        } else {
            newBooklet.set('individualToAll', false);
            newBooklet.set('individualValues',  bookletFromApi.vouchers.length > 0 ? bookletFromApi.vouchers[0].value : null);
        }

        newBooklet.set('beneficiary',
            bookletFromApi.distribution_beneficiary ? Beneficiary.apiToModel(bookletFromApi.distribution_beneficiary.beneficiary) : null);
        newBooklet.set('distribution',
            bookletFromApi.distribution_beneficiary ?
            Distribution.apiToModel(bookletFromApi.distribution_beneficiary.distribution_data) :
            null);

        newBooklet.fields.beneficiary.displayTableFunction = (value: Beneficiary) => value ? value.get('fullName') : null;
        newBooklet.fields.beneficiary.displayModalFunction = (value: Beneficiary) => value ? value.get('fullName') : null;
        newBooklet.fields.distribution.displayTableFunction = (value: Distribution) => value ? value.get('name') : null;
        newBooklet.fields.distribution.displayModalFunction = (value: Distribution) => value ? value.get('name') : null;
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
            password: password,
            individual_values: values,
            currency: this.get('currency').get('name'),
            inidividual_to_all: this.get('individualToAll'),
            number_booklets: this.get('NumberOfBooklets'),
            number_vouchers: this.get('NumberOfVouchers'),
        };
    }
}
