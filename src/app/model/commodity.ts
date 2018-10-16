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
     /**
     * Commodity's type of modality
     * @type {ModalityType}
     */
    modality_type: ModalityType;

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
            modality: "selectSingle",
            type: "selectSingle",
            unit: "text",
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


    /**
     * used to format modal return data
     * @param element 
     * @param loadedData 
     */
    public static formatFromModalAdd(element: any, loadedData:any): Commodity {
        let commodity: Commodity = new Commodity;

        let modalityType: ModalityType = new ModalityType;
        modalityType.id = element.type;
        commodity.modality_type = modalityType
        
        //search which modality was selected with its id
        for(let i=0; i<loadedData.modality.length; i++) {
            if(loadedData.modality[i].id === element.modality) {
                commodity.modality = loadedData.modality[i].name;
                break;
            }
        }

        //search which modality type was seleted with its id
        for(let i=0; i<loadedData.type.length; i++) {
            if(loadedData.type[i].id === element.type) {
                commodity.type = loadedData.type[i].name;
                break;
            }
        }
        commodity.unit = element.unit;
        commodity.value = element.value;
        return commodity;
    }
}


export class ModalityType {
    static __classname__ = 'ModalityType';
    /**
     * Modality type's id
     * @type {number}
     */
    id: number;

    /**
     * Eventually modality name
     * @type {string}
     */
    name: string;

}
