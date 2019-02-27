import { GlobalText } from '../../texts/global';

export class Sector {
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
    name = '';

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
        }
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.model_sector;
    }
}
