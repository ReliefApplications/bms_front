import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { SelectModelField } from './select-model-field';

export class MultipleSelectModelField extends SelectModelField<Array<CustomModel>> {

    // Todo: type with T
    /**
     * Described field
     * @type {Array<CustomModel>}
     */
    value: Array<CustomModel>;

    kindOfField = 'MultipleSelect';

    /**
     * Label to format for api
     * @type {string}
     */
    apiLabel: string;


    formatForApi(): any {
        return this.value.map(option => {
            return option.fields[this.apiLabel].value;
        });
    }
}
