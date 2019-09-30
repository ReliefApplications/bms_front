import { CustomModelField } from './custom-model-field';
import { CustomModel } from './custom-model';

export class MultipleObjectsModelField<T> extends CustomModelField<CustomModel[]> {
    kindOfField = 'MultipleObject';

     /**
     * Described field
     * @type {Array<CustomModel>}
     */
    value: Array<CustomModel>;

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

    formatForApi(): any {
        return this.value ? this.value.map(object => object.modelToApi()) : null;
    }

}
