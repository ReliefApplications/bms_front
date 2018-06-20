import { Sector             } from "./sector"

export class Project {
    /**
     * Project's name
     * @type {string}
     */
    name: string = '';
    /**
     * Project's sector
     * @type {Sector}
     */
    sector: Sector;


    constructor(instance){
        if(instance !== undefined){
            this.name = instance.name;
            this.sector = Object.assign({},instance.sector);
        }
    }
}