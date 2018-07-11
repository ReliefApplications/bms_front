export class Data {

    static __classname__ = 'data';
    /**
     * Households' id to compare
     * @type {number}
     */
    id: number;
    /**
     * Households' familyName and first name to compare
     * @type {string}
     */
    name: string = '';
    /**
     * Households' address to compare
     * @type {string}
     */
    address: string = '';
    /**
     * Households' adm1 to compra
     * @type {string}
     */
    adm1: string = '';
        /**
     * Households' adm2 to compra
     * @type {string}
     */
    adm2: string = '';
        /**
     * Households' adm3 to compra
     * @type {string}
     */
    adm3: string = '';
        /**
     * Households' adm4 to compra
     * @type {string}
     */
    adm4: string = '';
    /**
     * Households' beneficiary to compare
     * @type {Array}
     */
    beneficiary: Array<any> = [];
    /**
     * Number of dependents in household to compare
     * @type {number}
     */
    dependent: number = 0;

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.name = instance.name;
            this.address = instance.address;
            this.adm1 = instance.adm1;
            this.adm2 = instance.adm2;
            this.adm3 = instance.adm3;
            this.adm4 = instance.adm4;
            this.beneficiary = instance.beneficiary;
            this.dependent = instance.dependent;

        }
    }
}

export class DataValidation {
    static __classname__ = 'DataValidation';
    /**
     * new data to compare
     * @type {Data}
     */
    new: Data = new Data;
    /**
     * old data to compare
     * @type {Data}
     */
    old: Data = new Data;

    constructor(instance?){
        if(instance !== undefined){
            this.old = instance.old;
            this.new = instance.new;
        }
    }

    public static formatArray(instance): DataValidation[]{
        let dataValidation : DataValidation[] = [];
        console.log("instance", instance);
        instance.forEach(element => {
            dataValidation.push(this.formatElement(element));
        });
        return dataValidation;
    }

    public static formatElement(element: any): DataValidation {
        let data = new DataValidation();
        
        //to format information of new households
        element.new.beneficiaries.forEach(beneficiary => {
            if(beneficiary.status == '1') {
                data.new.name = beneficiary.family_name + " " + beneficiary.given_name;
            } else{
                data.new.beneficiary.push(beneficiary.family_name + " " + beneficiary.given_name);
                data.new.dependent = data.new.dependent + 1;
            }
        });
        data.old.id = element.id;
        data.new.address = element.new.address_number + " " + element.new.address_street;
        data.new.adm1 =  element.new.location.adm1 ;
        data.new.adm2 =  element.new.location.adm2 ;
        data.new.adm3 =  element.new.location.adm3 ;
        data.new.adm4 =  element.new.location.adm4 ;

        //to format information of old households
        element.old.forEach(oldElement => {
            oldElement.beneficiaries.forEach(beneficiary => {
                if(beneficiary.status == '1') {
                    data.old.name = beneficiary.family_name + " " + beneficiary.given_name;
                }
                else {
                    data.old.beneficiary.push(beneficiary.family_name + " " + beneficiary.given_name);
                    data.old.dependent = data.old.dependent + 1;

                }
            });
            data.old.id = oldElement.id;
            data.old.address = oldElement.address_number + " " + oldElement.address_street;
            data.old.adm1 =  oldElement.location.adm1 ;
            data.old.adm2 =  oldElement.location.adm2 ;
            data.old.adm3 =  oldElement.location.adm3 ;
            data.old.adm4 =  oldElement.location.adm4 ;
        });
        

        return data;
    }
}

