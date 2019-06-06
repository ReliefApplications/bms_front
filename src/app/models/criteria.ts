import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { Gender } from './beneficiary';

export class CriteriaCondition extends CustomModel {

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
export class CriteriaType extends CustomModel {

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

export class CriteriaValue extends CustomModel {

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
export class Criteria extends CustomModel {
    title =  this.language.model_criteria;
    matSortActive = 'field';

    public genders = [
        new Gender('0', this.language.add_distribution_female),
        new Gender('1', this.language.add_distribution_male)
    ];

    public fields = {
        // id: new NumberModelField(
        //     {
        //         // Not displayed anywhere
        //     }
        // ),
        kindOfBeneficiary: new TextModelField(
            {

            }
        ),
        tableString: new TextModelField({

        }),
        field: new TextModelField(
            {
                title: this.language.model_criteria,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isRequired: true,
            }
        ),
        condition: new SingleSelectModelField(
            {
                title: this.language.model_criteria_operator,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isRequired: true,
                bindField: 'name',
                apiLabel: 'name'
            }
        ),
        type: new SingleSelectModelField(
            {
            }
        ),

        // Not really a single select, but can have an id and string, as gender for example
        value: new SingleSelectModelField(
            {
                title: this.language.model_value,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                bindField: 'name',
                apiLabel: 'id'
            }
        ),
        weight: new NumberModelField(
            {
                title: this.language.model_criteria_weight,
                value: 1,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }
        ),

    };

    public static apiToModel(criteriaFromApi: any): Criteria {
        const newCriteria = new Criteria();

        newCriteria.set('field', criteriaFromApi.field_string);
        newCriteria.set('type', criteriaFromApi.type);
        newCriteria.set('kindOfBeneficiary', criteriaFromApi.kind_beneficiary);
        newCriteria.set('tableString', criteriaFromApi.table_string);

        // If it is a criteria associated with a distribution, it already has a value and condition
        const condition = criteriaFromApi.condition_string;
        newCriteria.set('condition', condition ? new CriteriaCondition(null, condition) : null);
        const value = criteriaFromApi.value_string;
        if (criteriaFromApi.field_string === 'gender' && value) {
            const genderValue = newCriteria.genders.filter((gender: Gender) => gender.get('id') === value)[0];
            newCriteria.set('value', new CriteriaValue(value, genderValue.get('name')));
        }
        else {
            newCriteria.set('value', new CriteriaValue(value, value));
        }

        return newCriteria;
    }

    public modelToApi(): Object {
        return {
            condition_string: this.get('condition').get('name'),
            field_string: this.get('field'),
            kind_beneficiary: this.get('kindOfBeneficiary'),
            table_string: this.get('tableString'),
            value_string: this.get('value').get('id'),
            weight: this.get('weight'),
            type: this.get('type'),
        };
    }

    public getIdentifyingName() {
        return this.get('field').get<string>('name');
    }
}
