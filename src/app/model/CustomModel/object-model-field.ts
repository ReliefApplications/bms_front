import { CustomModelField } from './custom-model-field';

export class ObjectModelField<CustomModel> extends CustomModelField<CustomModel> {
    kindOfField = 'Object';

     /**
     * Described field
     * @type {CustomModel}
     */
    value: CustomModel;

    /**
     * What to display and how
     * @type {Function}
     */
    displayFunction: Function;
}
