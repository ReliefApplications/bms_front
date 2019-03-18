import { CustomModelField } from './custom-model-field';

export class TextModelField extends CustomModelField<string> {
    kindOfField = 'Text';
    /**
     * Is the input a long string ?
     * @type {boolean}
     */
    isLongText: boolean;
    /**
     * Is the input a long string ?
     * @type {boolean}
     */
    isPassword: boolean;

    constructor(properties: any) {
        super(properties);

        this.isLongText             = properties['isLongText'];
        this.isPassword             = properties['isPassword'];
    }
}
