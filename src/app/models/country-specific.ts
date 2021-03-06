import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

export class CountrySpecificType extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: number, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}
export class CountrySpecific extends CustomModel {


    title = this.language.country_specific;
    matSortActive = 'field';

    public fields = {
        id : new NumberModelField(
            {
                title: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
            },
        ),
        field : new TextModelField(
            {
                title: this.language.country_specific_field,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        type : new SingleSelectModelField<string>(
            {
                title: this.language.type,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                options: [ new CountrySpecificType(1, 'text'), new CountrySpecificType(2, 'number') ],
                bindField: 'name',
                isEditable: true,
                isSettable: true,
                apiLabel: 'name',
            }
        ),
        answer: new TextModelField(
            {

            }
        ),
        countryIso3: new TextModelField(
            {

            }
        ),
        name: new TextModelField(
            {

            }
        )
    };

    public static apiToModel(countrySpecificFromApi: any): CountrySpecific {
        const newCountrySpecific = new CountrySpecific();

        if (countrySpecificFromApi.country_specific) {
            newCountrySpecific.set('answer', countrySpecificFromApi.answer);
            countrySpecificFromApi = countrySpecificFromApi.country_specific;
        }
        newCountrySpecific.set('id', countrySpecificFromApi.id);
        newCountrySpecific.set('type', countrySpecificFromApi.type === 'text' ?
            newCountrySpecific.getOptions('type')[0] :
            newCountrySpecific.getOptions('type')[1]);

        newCountrySpecific.set('field', countrySpecificFromApi.field_string);
        newCountrySpecific.set('countryIso3', countrySpecificFromApi.country_iso3 ? countrySpecificFromApi.country_iso3 : null);
        newCountrySpecific.set('name', countrySpecificFromApi.field ? countrySpecificFromApi.field : null);

        return newCountrySpecific;
    }

    public modelToApi(): object {
        return {
            id: this.fields.id.formatForApi(),
            type: this.fields.type.formatForApi(),
            field: this.fields.field.formatForApi()
        };
    }

    public getIdentifyingName() {
        return this.get<string>('field');
    }
}




export class CountrySpecificAnswer extends CustomModel {

    public fields = {
        countrySpecific: new ObjectModelField<CountrySpecific>({

        }),
        answer: new TextModelField({

        })
    };

    public static apiToModel(countrySpecificAnswerFromApi: any): CountrySpecificAnswer {
        const newCountrySpecificAnswer = new CountrySpecificAnswer();
        newCountrySpecificAnswer.set('answer', countrySpecificAnswerFromApi.answer);
        newCountrySpecificAnswer.set('countrySpecific', CountrySpecific.apiToModel(countrySpecificAnswerFromApi.country_specific));

        return newCountrySpecificAnswer;
    }

    public modelToApi(): object {
        return {
            country_specific: this.get('countrySpecific').modelToApi(),
            answer: this.get('answer')
        };
    }
}
