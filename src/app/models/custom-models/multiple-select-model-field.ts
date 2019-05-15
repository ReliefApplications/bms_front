import { CustomModel } from 'src/app/models/custom-models/custom-model';
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
     * Max selection length
     * @type {number}
     */
    maxSelectionLength: number;


    formatForApi(): any {
        return this.value.map(option => {
            return option.get(this.apiLabel);
        });
    }
}
