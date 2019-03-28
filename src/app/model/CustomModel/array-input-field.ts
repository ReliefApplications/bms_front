import { CustomModelField } from './custom-model-field';

export class ArrayInputField<T> extends CustomModelField<T[]> {
    kindOfField = 'ArrayInputField';

    /**
     * Number of inputs
     * @type {string}
     */
    numberOfInputs: string;
}
