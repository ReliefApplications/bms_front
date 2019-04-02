import { SectorMapper } from './sector-mapper';
import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';

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

        newCriteria.fields.field.value = criteriaFromApi.field_string;
        newCriteria.fields.type.value = criteriaFromApi.type;
        newCriteria.fields.kindOfBeneficiary.value = criteriaFromApi.distribution_type;
        newCriteria.fields.tableString.value = criteriaFromApi.table_string;
        return newCriteria;
    }

    public modelToApi(): Object {
        return {
            condition_string: this.fields.condition.value.fields.name.value,
            field_string: this.fields.field.value.fields.name.value,
            kind_beneficiary: this.fields.kindOfBeneficiary.value,
            table_string: this.fields.tableString.value,
            value_string: this.fields.value.value,
            weight: this.fields.weight.value,
            type: this.fields.type.value,
        };
    }

    public getIdentifyingName() {
        return this.fields.field.value.fields.name.value;
    }
}
