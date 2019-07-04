import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { CustomModelField } from './custom-model-field';

export class SelectModelField<T> extends CustomModelField<T> {

    /**
     * Described field
     * @type {Array<CustomModel>}
     */
    value: T;


    /**
     * Name of the field to bind
     * @type {string}
     */
    bindField: string;

    /**
     * Method to get multiple choice options
     * @type {CustomModel[]}
     */
    options: CustomModel[];

    /**
     * Label to format for api
     * @type {string}
     */
    apiLabel: string;

    /**
     * If the string to be displayed in the dropdown is a translation
     * @type {boolean}
     */
    isTranslatable: boolean;

    constructor(properties: any) {
        super(properties);

        this.bindField              = properties['bindField'];
        this.options                = properties['options'];
        this.apiLabel               = properties['apiLabel'];
        this.isTranslatable               = properties['isTranslatable'];
    }
}
