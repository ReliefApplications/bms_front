import { SectorMapper                                                                       } from "./sector-mapper";
import { GlobalText                                                                         } from "../../texts/global";

export class Criteria {
    static __classname__ = 'Criteria';
    /**
     * Criteria's id
     * @type {number}
     */
    id: number;
    /**
     * Criteria's kind_beneficiary
     * @type {string}
     */
    kind_beneficiary: string = '';
    /**
     * Criteria's field
     * @type {string}
     */
    field: string = '';
    /**
     * Criteria's operator
     * @type {spring}
     */
    operator: string = '';
    /**
     * Criteria's value
     * @type {any}
     */
    value: any;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.kind_beneficiary = instance.kind_beneficiary;
            this.field = instance.field;
            this.operator = instance.operator;
            this.value = instance.value;
        }
    }

    public static getDisplayedName(){
        return GlobalText.TEXTS.model_criteria;
    }

    /**
    * return a Criteria after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            kind_beneficiary: selfinstance.kind_beneficiary,
            field: selfinstance.field,
            operator: selfinstance.operator,
            value: selfinstance.value
        }
    }

    /**
    * return a Criteria after formatting its properties for the modal add
    */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            kind_beneficiary: selfinstance.kind_beneficiary,
            field: selfinstance.field,
            operator: selfinstance.operator,
            value: selfinstance.value
        }
    }

    /**
    * return the type of Criteria properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            kind_beneficiary: "text",
            field: "text",
            operator: "text",
            value: "text",
        }
    }

    /**
    * return the type of Criteria properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            kind_beneficiary: "select",
            field: "select",
            operator: "select",
            value: "text",
        }
    }

    /**
    * return Criteria properties name displayed
    */
    static translator(): Object {
        return {
            kind_beneficiary: GlobalText.TEXTS.model_criteria_kind_beneficiary,
            field: GlobalText.TEXTS.model_criteria_field,
            operator: GlobalText.TEXTS.model_criteria_operator,
            value: GlobalText.TEXTS.model_criteria_value,
        }
    }

    public static formatArray(instance): Criteria[] {
        let criterias: Criteria[] = [];
        instance.forEach(element => {
            criterias.push(this.formatFromApi(element));
        });
        return criterias;
    }

    public static formatFromApi(element: any): Criteria {
        let criteria = new Criteria(element);

        return criteria;
    }

    public static formatForApi(element: Criteria): any {
        return new Criteria(element);
    }
}