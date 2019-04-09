import { TextModelField } from './CustomModel/text-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { GlobalText } from 'src/texts/global';
import { CustomModel } from './CustomModel/custom-model';

export class NationalIdType extends CustomModel {

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

export class NationalId extends CustomModel {
    public fields = {
        type: new SingleSelectModelField(
            {
                options: [
                    new NationalIdType('0', GlobalText.TEXTS.national_id_passport),
                    new NationalIdType('1', GlobalText.TEXTS.national_id_card),
                    new NationalIdType('2', GlobalText.TEXTS.national_id_license),
                    new NationalIdType('3', GlobalText.TEXTS.national_id_family_registry),
                    new NationalIdType('4', GlobalText.TEXTS.national_id_other)
                ],
                value: new NationalIdType('1', GlobalText.TEXTS.national_id_card),
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
        newId.getOptions('type').forEach((option: NationalIdType) => {
            if (option.get('name') === idFromApi.id_type) {
                newId.set('type', option);
            }
        });
        newId.set('number', idFromApi.id_number);
        return newId;
    }

    public modelToApi(): Object {
        return {
            id_number: this.get('number'),
            id_type: this.fields.type.formatForApi()
        };
    }
}
