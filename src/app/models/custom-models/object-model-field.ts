import { CustomModelField } from './custom-model-field';
import { CustomModel } from './custom-model';

export class ObjectModelField<T> extends CustomModelField<CustomModel> {
    kindOfField = 'Object';

     /**
     * Described field
     * @type {CustomModel}
     */
    value: CustomModel;

     /**
     * What to display in the table and how
     * @type {Function}
     */
    displayTableFunction: Function;

    /**
     * What to display in the modal and how
     * @type {Function}
     */
    displayModalFunction: Function;

    formatForApi(): any {
        return this.value ? this.value.modelToApi() : null;
    }

}
