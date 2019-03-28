import { CustomModelField } from './custom-model-field';

export class MultipleObjectsModelField<CustomModel> extends CustomModelField<CustomModel[]> {
    kindOfField = 'MultipleObject';

     /**
     * Described field
     * @type {Array<CustomModel>}
     */
    value: Array<CustomModel>;

    /**
     * What to display and how
     * @type {Function}
     */
    displayFunction: Function;

}
