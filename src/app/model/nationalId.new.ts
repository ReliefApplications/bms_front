import { TextModelField } from './CustomModel/text-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { GlobalText } from 'src/texts/global';

export class NationalId {
    public fields = {
        type: new SingleSelectModelField(
            {
                options: [
                    { fields : {
                        name: { value: GlobalText.TEXTS.national_id_passport },
                        id: { value: 0 },
                    }},
                    { fields : {
                        name: { value: GlobalText.TEXTS.national_id_card },
                        id: { value: 1 },
                    }},
                    { fields : {
                        name: { value: GlobalText.TEXTS.national_id_license },
                        id: { value: 2 },
                    }},
                    { fields : {
                        name: { value: GlobalText.TEXTS.national_id_family_registry },
                        id: { value: 3 },
                    }},
                    { fields : {
                        name: { value: GlobalText.TEXTS.national_id_other },
                        id: { value: 4 },
                    }},
                ],
                value: { fields : {
                    name: { value: GlobalText.TEXTS.national_id_card },
                    id: { value: 1 },
                }},
                apiLabel: 'name'
            }
        ),
        number: new TextModelField(
            {

            }
        )
    };

    public static apiToModel(idFromApi): NationalId {
        const newId = new NationalId();
        newId.fields.type.options.forEach(option => {
            if (option.fields.name.value === idFromApi.id_type) {
                newId.fields.type.value = option;
            }
        });
        newId.fields.number.value = idFromApi.id_number;
        return newId;
    }

    public modelToApi(): Object {
        return {
            id_number: this.fields.number.value,
            id_type: this.fields.type.formatForApi()
        };
    }
}
