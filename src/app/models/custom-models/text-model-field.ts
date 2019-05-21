import { CustomModelField } from './custom-model-field';

export class TextModelField extends CustomModelField<string> {
    kindOfField = 'Text';
    /**
     * Is the input a long string ?
     * @type {boolean}
     */
    isLongText: boolean;
    /**
     * Is it a password ?
     * @type {boolean}
     */
    isPassword: boolean;
    /**
     * Is it a color ?
     * @type {boolean}
     */
    isColor;
    /**
     * Is it a font ?
     * @type {boolean}
     */
    isFont;

    constructor(properties: any) {
        super(properties);

        this.isLongText             = properties['isLongText'];
        this.isPassword             = properties['isPassword'];
        this.isColor                = properties['isColor'];
        this.isFont                 = properties['isFont'];

    }
}
