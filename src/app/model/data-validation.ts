import { Households } from "./households";

/**
 * Data contained in new and old after treatment
 */
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
}

/**
 * Format data with fields new and old of type Data
 */
export class FormatDataNewOld {
    static __classname__ = 'FormatDataNewOld';
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

    constructor(instance?) {
        if (instance !== undefined) {
            this.old = instance.old;
            this.new = instance.new;
        }
    }

    /**
     * Array containing an array of old and new household
     * Used at step 1 : typo issues
     * @param instance 
     */
    public static formatTypo(instance: any): FormatDataNewOld[] {
        let dataFormatted: FormatDataNewOld[] = [];
        instance.data.forEach(element => {
            dataFormatted.push(this.formatDataOldNew(element));
        });
        return dataFormatted;
    }

    public static formatDataOldNew(element: any): FormatDataNewOld {
        let data = new FormatDataNewOld();
        data.new.households = element.new;

        //to format information of new households
        element.new.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status == '1') {
                data.new.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
            }
        });
        //to format information of old households
        data.old.households = element.old;
        element.old.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status == '1') {
                data.old.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
            }
        });
        return data;
    }
}

/**
 * Model to return typo issues after correction
 */
export class VerifiedTypo {

    static __classname__ = 'VerifiedTypo';
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
    id_old: number;
    /**
     * index link to the data to find them more easily 
     * @type {number}
     */
    index: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.state = instance.state;
            this.new = instance.new;
            this.id_old = instance.id_old;
        }
    }

}

export class FormatDuplicatesData {
    static __classname__ = 'FormatDuplicatesData';
    /**
     * array of new and old household
     * @type {Array}
     */
    data: Array<FormatDataNewOld>;
    /**
     * new_household to return to back without modification
     * @type {Households}
     */
    new_households: Households = new Households;


    constructor(instance?) {
        if (instance !== undefined) {
            this.data = instance.data;
            this.new_households = instance.new_households;
        }
    }

    public static formatDuplicates(instance: any): FormatDuplicatesData[] {
        let formatDuplicates: FormatDuplicatesData[] = [];
        let duplicates = new FormatDuplicatesData;
        instance.data.forEach(data => {
            duplicates.data =  [];
            data.data.forEach(element => {
                duplicates.data.push(FormatDataNewOld.formatDataOldNew(element));
            });
            duplicates.new_households = instance.new_household;

        });
        return formatDuplicates;
    }
}

