import { SectorMapper        } from "./sector-mapper";

export class CountrySpecific {
    static __classname__ = 'CountrySpecific';
     /**
     * CountrySpecific's field
     * @type {string}
     */
    field: string = '';
    /**
     * CountrySpecific's type
     * @type {string}
     */
    type: string = '';
    /**
     * CountrySpecific's countryIso3
     * @type {string}
     */
    countryIso3: string = '';

    constructor(instance?){
        if(instance !== undefined){
            this.field = instance.field;
            this.type = instance.type;
            this.countryIso3 = instance.countryIso3;
        }
    }

    /**
    * return a CountrySpecific after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;
    
        return {
            field : selfinstance.field,
            type : selfinstance.type,
        }
    }

    /**
    * return a CountrySpecific after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            field : selfinstance.field,
            type : selfinstance.type,
            countryIso3 : selfinstance.countryIso3
        } 
    }

    /**
    * return the type of CountrySpecific properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            field : "text",
            type : "text",
        }
    }

    /**
    * return CountrySpecific properties name displayed
    */
    static translator(): Object {
        return {
            field : "Field",
            type : "Type"
        }
    }

    public static formatArray(instance): CountrySpecific[]{
        let countrySpecific : CountrySpecific[] = [];
        instance.forEach(element => {
            countrySpecific.push(this.formatCountrySpecific(element));
        });
        return countrySpecific;
    }

    public static formatCountrySpecific(element: any): CountrySpecific{
        let countrySpecific = new CountrySpecific();
        countrySpecific.field = element.field;
        countrySpecific.type = element.type;
        countrySpecific.countryIso3 = element.countryIso3;

        return countrySpecific;
    }
}