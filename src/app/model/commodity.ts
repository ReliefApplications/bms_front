import { SectorMapper } from './sector-mapper';
import { GlobalText } from '../../texts/global';

export class Modality {
    static __classname__ = 'Modality';

    /**
     * Eventually modality name
     * @type {string}
     */
    name: string;
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

    /**
     * Eventually modality subtype
     * @type {Modality}
     */
    modality: Modality;
}

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
    modality = '';
    /**
     * Commodity's type
     * @type {string}
     */
    type = '';
    /**
     * Commodity's unit
     * @type {string}
     */
    unit = '';
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

    public static getDisplayedName() {
        return GlobalText.TEXTS.model_commodity;
    }
    /**
    * return Commodity properties name displayed
    */
    public static translator(): Object {

        return {
            modality: GlobalText.TEXTS.model_commodity_modality,
            type: GlobalText.TEXTS.model_type,
            unit: GlobalText.TEXTS.model_commodity_unit,
            value: GlobalText.TEXTS.model_commodity_value,
        };
    }

    public static formatArray(instance): Commodity[] {
        const commoditys: Commodity[] = [];
        if (instance) {
            instance.forEach(element => {
                commoditys.push(this.formatFromApi(element));
            });
        }
        return commoditys;
    }

    public static formatFromApi(element: any): Commodity {
        const commodity = new Commodity(element);

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
    public static formatFromModalAdd(element: any, loadedData: any): Commodity {
        const commodity: Commodity = new Commodity;

        const modalityType: ModalityType = new ModalityType;
        modalityType.id = element.type;
        commodity.modality_type = modalityType;

        // search which modality was selected with its id
        for (let i = 0; i < loadedData.modality.length; i++) {
            if (loadedData.modality[i].id === element.modality) {
                commodity.modality = loadedData.modality[i].name;
                break;
            }
        }

        // search which modality type was seleted with its id
        for (let i = 0; i < loadedData.type.length; i++) {
            if (loadedData.type[i].id === element.type) {
                commodity.type = loadedData.type[i].name;
                break;
            }
        }
        commodity.unit = element.unit;
        commodity.value = element.value;
        return commodity;
    }


    static getUnit(type: number): string {
        switch (type) {
            case 1: // Mobile Cash
                return 'Currency';
            case 2: // QR Code Voucher
                return 'Unit';
            case 3: // Food
            case 4: // RTE Kit
            case 6: // Agricultural Kit
            case 7: // Wash kit
                return 'Kit';
            case 5: // Bread
                return 'Kgs';
            case 8: // Loan
                return 'Currency';
            default:
                return 'Unit';
        }
    }

    /**
    * return a Commodity after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            modality: selfinstance.modality,
            type: selfinstance.type,
            unit: selfinstance.unit,
            value: selfinstance.value
        };
    }

    /**
    * return a Commodity after formatting its properties for the modal add
    */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            modality: selfinstance.modality,
            type: selfinstance.type,
            unit: selfinstance.unit,
            value: selfinstance.value
        };
    }

    /**
    * return the type of Commodity properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            modality: 'text',
            type: 'text',
            unit: 'text',
            value: 'number',
        };
    }

    /**
    * return the type of Commodity properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            modality: 'selectSingle',
            type: 'selectSingle',
            unit: 'text',
            value: 'number',
        };
    }

}
