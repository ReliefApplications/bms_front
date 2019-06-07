import { CustomModel } from './custom-models/custom-model';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

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
                    new NationalIdType('Passport', this.language.national_id_passport),
                    new NationalIdType('ID Card', this.language.national_id_card),
                    new NationalIdType('Driver\'s License', this.language.national_id_license),
                    new NationalIdType('Family Registry', this.language.national_id_family_registry),
                    new NationalIdType('Other', this.language.national_id_other)
                ],
                value: new NationalIdType('ID Card', this.language.national_id_card),
                apiLabel: 'id'
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
            if (option.get('id') === idFromApi.id_type) {
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
