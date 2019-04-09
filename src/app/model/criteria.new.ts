import { SectorMapper } from './sector-mapper';
import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';

export class CriteriaField extends CustomModel {

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
export class Criteria extends CustomModel {
    title =  GlobalText.TEXTS.model_criteria;

    public fields = {
        // id: new NumberModelField(
        //     {
        //         // Not displayed anywhere
        //     }
        // ),
        kindOfBeneficiary: new NumberModelField(
            {

            }
        ),
        tableString: new TextModelField({

        }),
        field: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.model_criteria,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                bindField: 'name',
            }
        ),
        condition: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.model_criteria_operator,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                bindField: 'name',
            }
        ),
        type: new SingleSelectModelField(
            {
            }
        ),
        value: new TextModelField(
            {
                title: GlobalText.TEXTS.model_value,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }
        ),
        weight: new NumberModelField(
            {
                title: GlobalText.TEXTS.model_criteria_weight,
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
        newCriteria.set('kindOfBeneficiary', criteriaFromApi.distribution_type);
        newCriteria.set('tableString', criteriaFromApi.table_string);
        return newCriteria;
    }

    public modelToApi(): Object {
        return {
            condition_string: this.get('condition').get('name'),
            field_string: this.get('field').get('name'),
            kind_beneficiary: this.get('kindOfBeneficiary'),
            table_string: this.get('tableString'),
            value_string: this.get('value'),
            weight: this.get('weight'),
            type: this.get('type'),
        };
    }

    public getIdentifyingName() {
        return this.get('field').get<string>('name');
    }
}
