import { CustomModelField } from './custom-model-field';

export class ObjectModelField<CustomModel> extends CustomModelField<CustomModel> {
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
     * What to display in the table and how
     * @type {Function}
     */
    displayModalFunction: Function;

}
