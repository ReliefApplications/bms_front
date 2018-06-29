import { SectorMapper        } from "./sector-mapper";

export class DistributionData {
    static __classname__ = 'DistributionData';
    /**
     * DistributionData's id
     * @type {number}
     */
    id: number;
    /**
     * DistributionData's name
     * @type {string}
     */
    name: string = '';
     /**
     * DistributionData's sector
     * @type {string}
     */
    sector: string = '';
    /**
     * DistributionData's location
     * @type {string}
     */
    location: string;
    /**
     * DistributionData's numberBeneficiaries
     * @type {Int16Array}
     */
    numberBeneficiaries: Int16Array;

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.name = instance.name;
            this.sector = instance.sector;
            this.location = instance.location;
            this.numberBeneficiaries = instance.numberBeneficiaries;
        }
    }

    /**
    * return a DistributionData after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location: selfinstance.location,
            numberBeneficiaries: selfinstance.numberBeneficiaries,
            sector: selfinstance.sector,
        }
    }

    /**
    * return a DistributionData after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location: selfinstance.location,
            numberBeneficiaries: selfinstance.numberBeneficiaries,
            sector: selfinstance.sector,
        }  
    }

    /**
    * return the type of DistributionData properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            name: "text",
            location:"text",
            numberBeneficiaries:"number",
            sector: "image",
        }
    }

    /**
    * return DistributionData properties name displayed
    */
    static translator(): Object {
        return {
            name: "Distribution",
            location:"Location",
            numberBeneficiaries:"n° Beneficiaries",
            sector: "Sector",
        }
    }
}