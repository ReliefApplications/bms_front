export class Data {

    static __classname__ = 'data';
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
     * Households' location to compra
     * @type {string}
     */
    location: string = '';

    constructor(instance?){
        if(instance !== undefined){
            this.name = instance.name;
            this.address = instance.address;
            this.location = instance.location;

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
            if(beneficiary.status) {
                data.new.name = beneficiary.family_name + " " + beneficiary.given_name;
            }
        });
        data.new.address = element.new.address_number + " " + element.new.address_street;
        data.new.location = element.new.location.adm4 + " " + element.new.location.adm3 + " " +
                                element.new.location.adm2 + " " +  element.new.location.adm1 + " "  ;


        //to format information of old households
        element.old.forEach(oldElement => {
            oldElement.beneficiaries.forEach(beneficiary => {
                if(beneficiary.status) {
                    data.old.name = beneficiary.family_name + " " + beneficiary.given_name;
                }
            });
            data.old.address = oldElement.address_number + " " + oldElement.address_street;
            data.old.location = oldElement.location.adm4 + " " + oldElement.location.adm3 + " " +
                                    oldElement.location.adm2 + " " +  oldElement.location.adm1 + " "  ;
        });
        

        return data;
    }
}

