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
                        id: { value: 0 }
                    }},
                    {fields: {
                        name: { value: 'Mobile' },
                        id: { value: 1 }
                    }}
                ]
            }
        )
    };

    public static apiToModel(phoneFromApi): Phone {
        const newPhone = new Phone();
        newPhone.fields.id.value = phoneFromApi.id;
        newPhone.fields.number.value = phoneFromApi.number;
        newPhone.fields.prefix.value = phoneFromApi.prefix;
        newPhone.fields.proxy.value = phoneFromApi.proxy;
        newPhone.fields.type.value = phoneFromApi.type;

        return newPhone;
    }
}
