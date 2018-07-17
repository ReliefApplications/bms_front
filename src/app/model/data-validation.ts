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

    constructor(instance?) {
        if (instance !== undefined) {
            this.nameHead = instance.nameHead;
            this.households = instance.households;
            this.dependent = instance.dependent;


        }
    }
}

export class DataToValidate {
    static __classname__ = 'DataToValidate';
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

    constructor(instance?) {
        if (instance !== undefined) {
            this.old = instance.old;
            this.new = instance.new;
            this.conflictMerged = instance.conflictMerged;
        }
    }

    public static formatArray(instance): DataToValidate[] {
        let dataValidation: DataToValidate[] = [];
        instance.forEach(element => {
            dataValidation.push(this.formatElement(element));
        });
        return dataValidation;
    }

    public static formatElement(element: any): DataToValidate {
        let data = new DataToValidate();
        data.new.households = element.new;

        //to format information of new households
        element.new.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status == '1') {
                data.new.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
            } else {
                data.new.dependent = data.new.dependent + 1;
            }
        });
        //to format information of old households
        data.old.households = element.old;
        element.old.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status == '1') {
                data.old.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
            }
            else {
                data.old.dependent = data.old.dependent + 1;

            }
        });
        return data;
    }
}

export class VerifiedData {

    static __classname__ = 'VerifiedData';
    /**
     * new data to create
     * @type {Data}
     */
    new?: Data;
    /**
     * boolean to now which action is necessary : update, add, delete
     * @type {boolean}
     */
    state: boolean = false;
    /**
     * household's id 
     * @type {number}
     */
    idHousehold: number;
    /**
     * index link to the data to find them more easily 
     * @type {number}
     */
    index: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.state = instance.state;
            this.new = instance.new;
            this.idHousehold = instance.idHousehold;
        }
    }

}

