export class ConditionCriteria {

    /**
     * ConditionCriteria' field_string
     * @type {string}
     */
    field_string = '';

    constructor(fieldString?) {
        if (fieldString !== undefined) {
            this.field_string = fieldString;
        }
    }
}
