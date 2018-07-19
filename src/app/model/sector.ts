import { GlobalText } from "../../texts/global";

export class Sector {
	static _classnameDisplayed__ = GlobalText.translate('en').model_sector;
    static __classname__ = 'Sector';
    /**
     * Sector's id
     * @type {number}
     */
    id: number;
    /**
     * Sector's name
     * @type {string}
     */
    name: string = '';
    
    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.name = instance.name;
        }
    }
}