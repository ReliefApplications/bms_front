

export class Location {
    /**
     * DistributionData's id
     * @type {number}
     */
    id: number;

    /**
     * Administrate level 1
     * @type {string}
     */
    adm1: string = '';

    /**
    * Administrate level 2
    * @type {string}
    */
    adm2: string = '';

    /**
    * Administrate level 3
    * @type {string}
    */
    adm3: string = '';

    /**
    * Administrate level 4
    * @type {string}
    */
    adm4: string = '';
    /**
    * Administrate country
    * TODO: get the country of the plateforme
    * @type {string}
    */
    country_iso3: string = 'KHM'


    constructor(instance?){
        if(instance !== undefined && instance !== null){
            this.id = instance.id;
            this.adm1 = instance.adm1;
            this.adm2 = instance.adm2;
            this.adm3 = instance.adm3;
            this.adm4 = instance.adm4;
            this.country_iso3 = instance.country_iso3;
        }
    }

    public static formatAdm(instance): any[] {
        var adm = [];
        instance.forEach(element => {
            var concat = element.id + " - " + element.name;
            adm.push(concat);
        });
        
        return adm;
    }
}