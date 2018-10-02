

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
            adm.push( this.formatOneAdm(element) );
        });
        
        return adm;
    }

    public static formatOneAdm(element): any {
        var concat = element.id + " - " + element.name;

        return concat;
    }

    public static formatAdmFromApi(instance : any): any {

        if(instance.adm4) {
            instance.adm3 = instance.adm4.adm3;
            instance.adm4 = {
                id : instance.adm4.id,
                name : instance.adm4.name,
                code : instance.adm3.code,
            }
        }
        if(instance.adm3) {
            instance.adm2 = instance.adm3.adm2;
            instance.adm3 = {
                id : instance.adm3.id,
                name : instance.adm3.name,
                code : instance.adm3.code,
            }
        }
        if(instance.adm2) {
            instance.adm1 = instance.adm2.adm1;
            instance.adm2 = {
                id : instance.adm2.id,
                name : instance.adm2.name,
                code : instance.adm2.code,
            }
        }
        if(instance.adm1) {
            instance.country_iso3 = instance.adm1.country_i_s_o3;
            instance.adm1 = {
                id : instance.adm1.id,
                name : instance.adm1.name,
                code : instance.adm1.code,
            }
        }

        return(instance);
    }

}