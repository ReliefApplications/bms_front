import { CustomModelField } from './custom-model-field';

export class SelectModelField<T> extends CustomModelField<T> {

    kindOfField = 'Select';

    /**
     * Name of the field to bind
     * @type {string}
     */
    bindField: string;
    /**
     * Can you select multiple elements of this field among other options?
     * @type {boolean}
     */
    isMultipleSelect: boolean;

    /**
     * Method to get multiple choice options
     * @type {string}
     */
    options: T;

    constructor(properties: any) {
        super(properties);

        this.bindField              = properties['bindField'];
        this.isMultipleSelect       = properties['isMultipleSelect'];
        this.options                = properties['options'];
    }
}
