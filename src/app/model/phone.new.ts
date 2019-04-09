import { TextModelField } from './CustomModel/text-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { BooleanModelField } from './CustomModel/boolan-model-field';

export class Phone {
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
                    {fields: {
                        name: { value: 'Landline' },
                        id: { value: 1 }
                    }},
                    {fields: {
                        name: { value: 'Mobile' },
                        id: { value: 2 }
                    }}
                ],
                apiLabel: 'name'
            }
        )
    };

    public static apiToModel(phoneFromApi): Phone {
        const newPhone = new Phone();
        newPhone.fields.id.value = phoneFromApi.id;
        newPhone.fields.number.value = phoneFromApi.number;
        newPhone.fields.prefix.value = phoneFromApi.prefix;
        newPhone.fields.proxy.value = phoneFromApi.proxy;
        newPhone.fields.type.value = newPhone.fields.type.options.filter(option => option.fields.name.value === phoneFromApi.type)[0];

        return newPhone;
    }

    public modelToApi(): Object {
        return {
            number: this.fields.number.value,
            prefix: this.fields.prefix.value,
            proxy: this.fields.proxy.value ? true : false,
            type: this.fields.type.value ? this.fields.type.formatForApi() : null,

        };
    }
}
