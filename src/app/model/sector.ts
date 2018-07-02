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
    name: string = '';
    
    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.name = instance.name;
        }
    }
}