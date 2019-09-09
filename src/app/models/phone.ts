import { BooleanModelField } from './custom-models/boolan-model-field';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

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
                options: [
                    new PhoneType('Landline', this.language.phone_type_landline),
                    new PhoneType('Mobile', this.language.phone_type_mobile)
                ],
                apiLabel: 'id'
            }
        )
    };

    public static apiToModel(phoneFromApi): Phone {
        const newPhone = new Phone();
        newPhone.set('id', phoneFromApi.id);
        newPhone.set('number', phoneFromApi.number);
        newPhone.set('prefix', phoneFromApi.prefix);
        newPhone.set('proxy', phoneFromApi.proxy);
        newPhone.set('type', newPhone.getOptions('type').filter((option: PhoneType) => option.get('id') === phoneFromApi.type)[0]);

        return newPhone;
    }

    public modelToApi(): Object {
        return {
            number: this.fields.number.formatForApi(),
            prefix: this.fields.prefix.formatForApi(),
            proxy: this.fields.proxy.formatForApi(),
            type: this.fields.type.formatForApi(),

        };
    }
}
