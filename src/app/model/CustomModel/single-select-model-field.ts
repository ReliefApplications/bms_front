import { SelectModelField } from './select-model-field';

export class SingleSelectModelField<CustomModel> extends SelectModelField<CustomModel> {

    // Todo: type this
    /**
     * Described field
     * @type {any}
     */
    value: any;

    kindOfField = 'SingleSelect';

    formatForApi(): any {
        return this.value.get(this.apiLabel);
    }
}

