export class SelectionCriteria {
    static __classname__ = 'SelectionCriteria';
    /**
     * SelectionCriteria's id
     * @type {number}
     */
    id: number;
    /**
     * Administrate tableString
     * @type {string}
     */
    table_string: string = '';

     /**
     * Administrate fieldString
     * @type {string}
     */
    field_string: string = '';

     /**
     * Administrate valueString
     * @type {string}
     */
    value_string: string = '';

     /**
     * Administrate conditionString
     * @type {string}
     */
    condition_string: string = '';

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.table_string = instance.table_string;
            this.field_string = instance.field_string;
            this.value_string = instance.value_string;
            this.condition_string = instance.condition_string;
        }
    }
}