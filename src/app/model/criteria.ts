import { SectorMapper } from "./sector-mapper";
import { GlobalText } from "../../texts/global";

export class Criteria {
    static __classname__ = 'Criteria';
    /**
     * Criteria's id
     * @type {number}
     */
    id_field: number;
    /**
     * Criteria's kind_beneficiary
     * @type {string}
     */
    kind_beneficiary: string = '';
    /**
    * Criteria's table_string
    * @type {string}
    */
    table_string: string = '';
    /**
     * Criteria's field_string
     * @type {string}
     */
    field_string: string = '';
    /**
     * Criteria's condition_string
     * @type {spring}
     */
    condition_string: string = '';
    /**
     * Criteria's type
     * @type {spring}
     */
    type: string = '';
    /**
     * Criteria's value_string
     * @type {any}
     */
    value_string: any;
    /**
     * Criteria's weight
     * @type {number};
     */
    weight: number = 1;

    constructor(instance?) {
        if (instance !== undefined) {
            this.type = instance.type;
            this.id_field = instance.id;
            this.kind_beneficiary = instance.kind_beneficiary;
            this.field_string = instance.field_string;
            this.condition_string = instance.condition_string;
            this.value_string = instance.value_string;
            this.table_string = instance.table_string;
        }
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.model_criteria;
    }

    /**
    * return a Criteria after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            field_string: selfinstance.field_string,
            condition_string: selfinstance.condition_string,
            value_string: selfinstance.value_string,
            weight: selfinstance.weight
        }
    }

    /**
    * return a Criteria after formatting its properties for the modal add
    */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            field_string: selfinstance.field_string,
            condition_string: selfinstance.condition_string,
            value_string: selfinstance.value_string,
            weight: selfinstance.weight
        }
    }

    /**
    * return the type of Criteria properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            field_string: "text",
            condition_string: "text",
            value_string: "text",
            weight: "number"
        }
    }

    /**
    * return the type of Criteria properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            field_string: "select",
            condition_string: "select",
            value_string: "text",
            weight: "number"
        }
    }

    /**
    * return Criteria properties name displayed
    */
    static translator(): Object {
        return {
            field_string: GlobalText.TEXTS.model_criteria,
            condition_string: GlobalText.TEXTS.model_criteria_operator,
            value_string: GlobalText.TEXTS.model_criteria_value,
            weight: GlobalText.TEXTS.model_criteria_weight
        }
    }

    public static formatArray(instance): Criteria[] {
        let criterias: Criteria[] = [];
        if(instance)
        instance.forEach(element => {
            criterias.push(this.formatFromApi(element));
        });
        return criterias;
    }

    public static formatFromApi(element: any): Criteria {
        let criteria = new Criteria(element);

        return criteria;
    }

    /**
     * used in modal line
     * @param element
     * @param loadedData
     */
    public static formatFromModalAdd(element: any, loadedData: any): Criteria {
        let newObject = new Criteria(loadedData.field_string[element.field_string - 1]);
        if (!element.kind_beneficiary)
            element.kind_beneficiary = 1;
        if (!element.condition_string)
            element.condition_string = 1;

        newObject.kind_beneficiary = loadedData.kind_beneficiary[element.kind_beneficiary - 1].field_string;
        newObject.condition_string = loadedData.condition_string[element.condition_string - 1].field_string;

        if (newObject.field_string == "gender" || newObject.field_string == "dateOfBirth"
        || newObject.field_string == "IDPoor" || newObject.field_string == "equityCardNo") {
            if(element.value_string) {
                newObject.value_string = element.value_string;
            } else {
                newObject.value_string = "null";
            }
        }

        newObject.weight = element.weight;

        return newObject;
    }

    public static formatForApi(element: Criteria): any {
        return new Criteria(element);
    }
}
