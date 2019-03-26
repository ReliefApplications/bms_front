import { SelectModelField } from './select-model-field';

export class SingleSelectModelField<CustomModel> extends SelectModelField<CustomModel> {

    // Todo: type this
    /**
     * Described field
     * @type {any}
     */
    value: any;

    /**
     * Label to format for api
     * @type {string}
     */
    apiLabel: string;


    kindOfField = 'SingleSelect';

    formatForApi(): any {
        return this.value.fields[this.apiLabel].value;
    }
}

