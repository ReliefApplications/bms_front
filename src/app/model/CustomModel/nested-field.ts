import { CustomModelField } from './custom-model-field';

export class NestedFieldModelField extends CustomModelField<any> {
    kindOfField = 'Children';

     /**
     * Name of the children object field from which to fetch the children field
     * @type {string}
     */
    childrenObject: string;

    /**
     * Name of the children field in the children object
     * @type {string}
     */
    childrenFieldName: string;

    constructor(properties: any) {
        super(properties);

        this.childrenObject              = properties['childrenObject'];
        this.childrenFieldName                = properties['childrenFieldName'];
    }

}
