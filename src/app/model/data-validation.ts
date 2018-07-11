import { Households } from "./households";

export class Data {

    static __classname__ = 'data';
    /**
     * Households' familyName and first name to compare
     * @type {string}
     */
    nameHead: string = '';
    /**
     * Households
     * @type {Households}
     */
    households: Households = new Households;
    /**
     * Number of dependents in household to compare
     * @type {number}
     */
    dependent: number = 0;

    constructor(instance?){
        if(instance !== undefined){
            this.nameHead = instance.nameHead;
            this.households = instance.households;
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
    /**
     * To know if conflict is resolve
     * @type {boolean}
     */
    conflictMerged: boolean = false;

    constructor(instance?){
        if(instance !== undefined){
            this.old = instance.old;
            this.new = instance.new;
            this.conflictMerged = instance.conflictMerged;
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
        data.new.households = element.new;
        
        //to format information of new households
        element.new.beneficiaries.forEach(beneficiary => {
            if(beneficiary.status == '1') {
                data.new.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
            } else{
                data.new.dependent = data.new.dependent + 1;
            }
        });

        //to format information of old households
        element.old.forEach(oldElement => {
            data.old.households = oldElement;
            oldElement.beneficiaries.forEach(beneficiary => {
                if(beneficiary.status == '1') {
                    data.old.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
                }
                else {
                    data.old.dependent = data.old.dependent + 1;

                }
            });
        });
        

        return data;
    }
}

