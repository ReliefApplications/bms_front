import { SectorMapper                                                                       } from "./sector-mapper";
import { GlobalText                                                                         } from "../../texts/global";

export class Commodity {
    static __classname__ = 'Commodity';
    /**
     * Commodity's id
     * @type {number}
     */
    id: number;
    /**
     * Commodity's modality
     * @type {string}
     */
    modality: string = '';
    /**
     * Commodity's type
     * @type {string}
     */
    type: string = '';
    /**
     * Commodity's unit
     * @type {spring}
     */
    unit: string = '';
    /**
     * Commodity's value
     * @type {number}
     */
    value: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.modality = instance.modality;
            this.type = instance.type;
            this.unit = instance.unit;
            this.value = instance.value;
        }
    }

    public static getDisplayedName(){
        return GlobalText.TEXTS.model_commodity;
    }

    /**
    * return a Commodity after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            modality: selfinstance.modality,
            type: selfinstance.type,
            unit: selfinstance.unit,
            value: selfinstance.value
        }
    }

    /**
    * return a Commodity after formatting its properties for the modal add
    */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            modality: selfinstance.modality,
            type: selfinstance.type,
            unit: selfinstance.unit,
            value: selfinstance.value
        }
    }

    /**
    * return the type of Commodity properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            modality: "text",
            type: "text",
            unit: "text",
            value: "number",
        }
    }

    /**
    * return the type of Commodity properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            modality: "select",
            type: "select",
            unit: "select",
            value: "number",
        }
    }

    /**
    * return Commodity properties name displayed
    */
    static translator(): Object {
        return {
            modality: GlobalText.TEXTS.model_commodity_modality,
            type: GlobalText.TEXTS.model_commodity_type,
            unit: GlobalText.TEXTS.model_commodity_unit,
            value: GlobalText.TEXTS.model_commodity_value,
        }
    }

    public static formatArray(instance): Commodity[] {
        let commoditys: Commodity[] = [];
        instance.forEach(element => {
            commoditys.push(this.formatFromApi(element));
        });
        return commoditys;
    }

    public static formatFromApi(element: any): Commodity {
        let commodity = new Commodity(element);

        return commodity;
    }

    public static formatForApi(element: Commodity): any {
        return new Commodity(element);
    }
}