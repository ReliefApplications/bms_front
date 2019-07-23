import { SelectModelField } from './select-model-field';

export class SingleSelectModelField<CustomModel> extends SelectModelField<CustomModel> {

    // Todo: type this
    /**
     * Described field
     * @type {any}
     */
    value: any;

     /**
     * Sometimes when the value can have special characters such as <, >, etc, we need a mat-select to handle them
     * @type {boolean}
     */
    isMatSelect: boolean;

    kindOfField = 'SingleSelect';

    constructor(properties: any) {
        super(properties);
        this.isMatSelect               = properties['isMatSelect'];
    }

    formatForApi(): any {
        return this.value ? this.value.get(this.apiLabel) : null;
    }
}

