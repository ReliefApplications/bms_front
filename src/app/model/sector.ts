export class Sector {
    /**
     * Sector's name
     * @type {string}
     */
    name: string = '';
    
    constructor(instance){
        if(instance !== undefined){
            this.name = instance.name;
        }
    }
}