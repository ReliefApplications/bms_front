import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

export class CriteriaField extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({}),
        kindOfBeneficiary: new NumberModelField({}),
        tableString: new TextModelField({}),
        type: new SingleSelectModelField({}),
        field: new SingleSelectModelField({})
    };

    public static apiToModel(criteriaFromApi: any): CriteriaField {
        const newCriteriaField = new CriteriaField();

        newCriteriaField.set('field', criteriaFromApi.field_string);
        newCriteriaField.set('type', criteriaFromApi.type);
        newCriteriaField.set('kindOfBeneficiary', criteriaFromApi.distribution_type);
        newCriteriaField.set('tableString', criteriaFromApi.table_string);
        return newCriteriaField;
    }
}
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
        field: new SingleSelectModelField(
            {
                title: this.language.model_criteria,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isRequired: true,
                bindField: 'field',
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

        if (criteriaFromApi.field_string) {
            const field = new CriteriaField();
            field.set('field', criteriaFromApi.field_string);
            newCriteria.set('field', field);

        }
        newCriteria.set('type', criteriaFromApi.type);
        newCriteria.set('kindOfBeneficiary', criteriaFromApi.distribution_type ?
            criteriaFromApi.distribution_type :
            criteriaFromApi.kind_beneficiary);
        newCriteria.set('condition', criteriaFromApi.condition_string ?
            new CriteriaCondition(null, criteriaFromApi.condition_string) :
            null);
        newCriteria.set('tableString', criteriaFromApi.table_string);
        newCriteria.set('value', criteriaFromApi.value_string);
        return newCriteria;
    }

    public modelToApi(): Object {
        return {
            condition_string: this.get('condition').get('name'),
            field_string: this.get('field').get('field'),
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
