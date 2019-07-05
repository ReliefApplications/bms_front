import { CustomModelField } from './custom-model-field';

export class NumberModelField extends CustomModelField<number> {
    kindOfField = 'Number';
      /* The value to display (WARNING: can be set only from the api, not a modifiable field)
     * @type {string}
     */
    displayValue: string;

    constructor(properties: any) {
        super(properties);
        this.displayValue             = properties['displayValue'];
    }
}
