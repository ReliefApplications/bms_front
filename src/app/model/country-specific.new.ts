import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { GlobalText } from 'src/texts/global';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class CountrySpecific extends CustomModel {

    public static rights = ['ROLE_ADMIN', 'ROLE_COUNTRY_MANAGER', 'ROLE_PROJECT_MANAGER'];

    title = GlobalText.TEXTS.model_country_specific;

    public fields = {
        id : new NumberModelField(
            {
                title: null,
                placeholder: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
            },
        ),
        field : new TextModelField(
            {
                title: GlobalText.TEXTS.model_country_specific_field,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,

            }
        ),
        type : new SingleSelectModelField<string>(
            {
                title: GlobalText.TEXTS.model_type,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                options: [
                    { fields : {
                        name: { value: 'text'},
                        id: { value: 1}
                    }},
                    { fields : {
                        name: { value: 'number'},
                        id: { value: 2}
                    }},
                ],
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
            newCountrySpecific.fields.answer.value = countrySpecificFromApi.answer;
            countrySpecificFromApi = countrySpecificFromApi.country_specific;
        }
        newCountrySpecific.fields.id.value = countrySpecificFromApi.id;
        newCountrySpecific.fields.type.value = countrySpecificFromApi.type === 'text' ?
            newCountrySpecific.fields.type.options[0] :
            newCountrySpecific.fields.type.options[1];

        newCountrySpecific.fields.field.value = countrySpecificFromApi.field_string;
        newCountrySpecific.fields.countryIso3.value = countrySpecificFromApi.country_iso3 ? countrySpecificFromApi.country_iso3 : null;
        newCountrySpecific.fields.name.value = countrySpecificFromApi.field ? countrySpecificFromApi.field : null;

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
        return this.fields.field.value;
    }
}




export class CountrySpecificAnswer {
    static __classname__ = 'CountrySpecificAnswer';
    /**
     * Answer
     * @type { string}
     */
    answer = '';
    /**
     * @type {CountrySpecific}
     */
    country_specific: CountrySpecific;
}
