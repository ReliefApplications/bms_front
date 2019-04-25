import { TextModelField } from './CustomModel/text-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { CustomModel } from './CustomModel/custom-model';
import { GlobalText } from 'src/texts/global';

export class PhoneType extends CustomModel {

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

export class Phone extends CustomModel {
    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
        ),
        number: new TextModelField(
            {

            }
        ),
        prefix: new TextModelField(
            {

            }
        ),
        proxy: new BooleanModelField(
            {

            }
        ),
        type: new SingleSelectModelField(
            {
                options: [new PhoneType('1', 'Landline'), new PhoneType('2', 'Mobile')],
                apiLabel: 'name'
            }
        )
    };

    public static apiToModel(phoneFromApi): Phone {
        const newPhone = new Phone();
        newPhone.set('id', phoneFromApi.id);
        newPhone.set('number', phoneFromApi.number);
        newPhone.set('prefix', phoneFromApi.prefix);
        newPhone.set('proxy', phoneFromApi.proxy);
        newPhone.set('type', newPhone.getOptions('type').filter((option: PhoneType) => option.get('name') === phoneFromApi.type)[0]);

        return newPhone;
    }

    public modelToApi(): Object {
        return {
            number: this.get('number'),
            prefix: this.get('prefix'),
            proxy: this.get('proxy') ? true : false,
            type: this.get('type') ? this.fields.type.formatForApi() : null,

        };
    }
}
