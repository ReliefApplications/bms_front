import { Households } from "./households";

/**
 * Data contained in new and old object after treatment
 */
export class Data {
    static __classname__ = 'data';
    /**
     * Households' head familyName and first name
     * @type {string}
     */
    nameHead?: string;
    /**
     * All Households
     * @type {Households}
     */
    households: Households = new Households;
    /**
     * to know if beneficiaries is the head of household
     * @type {boolean}
     */
    isHead?: boolean = false;
}

/**
 * Format data with fields new and old of type Data
 * Used by all step
 * Typo issues, more and less are directly formatted by this function
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
    /**
     * id to find pair of new/old
     * @type {string}
     */
    id_tmp_beneficiary?: string;
    /**
     * id uses by the back
     * @type {number}
     */
    id_tmp_cache?: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.old = instance.old;
            this.new = instance.new;
            this.id_tmp_beneficiary = instance.id_tmp_beneficary;
            this.id_tmp_cache = instance.this.id_tmp_cache;
        }
    }

    /**
     * Array containing an object of old and new household
     * Used at step 1 : typo issues
     * Used at step 3 : more
     * Used at step 4 : less
     * Get the received instance after send the csv in parameter
     * @param instance any
     * @param step number
     * @return FormatDataNewOld[]
     */
    public static formatIssues(instance: any, step: number): FormatDataNewOld[] {
        let dataFormatted: FormatDataNewOld[] = [];
        instance.data.forEach(element => {
            dataFormatted.push(this.formatDataOldNew(element, step));
        });
        return dataFormatted;
    }

    /**
     * Used to format and type old and new data household
     * @param element any
     * @param step number
     * @return FormatDataNewOld
     */
    public static formatDataOldNew(element: any, step: number): FormatDataNewOld {
        let data = new FormatDataNewOld();
        data.new.households = element.new;
        data.old.households = element.old;
        data.id_tmp_cache = element.id_tmp_cache;
        //if step 2 (duplicates) format is different of other steps
        if (step === 2) {
            let oldBeneficiary;
            let newBeneficiary;

            element.old.beneficiaries.forEach(beneficiary => {
                //check in all old beneficiary to find head of household (status == true)
                if (beneficiary.status) {
                    data.old.isHead = true;
                }
                oldBeneficiary = element.old.id + beneficiary.family_name + beneficiary.given_name;
            });
            element.new.beneficiaries.forEach(beneficiary => {
                newBeneficiary = beneficiary.family_name + beneficiary.given_name;
            });

            //concat oldBeneficiary and newBeneficiary created earlier to get an unique identifiant for every beneficiary
            data.id_tmp_beneficiary = oldBeneficiary + "/" + newBeneficiary;

        } else {
            //for the step 1, 3, 4

            element.new.beneficiaries.forEach(beneficiary => {
                if (beneficiary.status == '1') {
                    //get the full name of head of household
                    data.new.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
                }
                //create an unique identifiant
                beneficiary.id_tmp = element.old.id + beneficiary.family_name + beneficiary.given_name;
            });
            element.old.beneficiaries.forEach(beneficiary => {
                if (beneficiary.status == '1') {
                    //get the full name of head of household
                    data.old.nameHead = beneficiary.family_name + " " + beneficiary.given_name;
                }
                //create an unique identifiant
                beneficiary.id_tmp = element.old.id + beneficiary.family_name + beneficiary.given_name;
            });
        }
        return data;
    }
}

/**
 * Model to return data after correction
 * Used in step 1 and 2
 */
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
    state?: boolean = false;
    /**
     * old household's id
     * @type {number}
     */
    id_old: number;
    /**
     * index create by the ngFor in html
     * Link the data to find them more easily
     * @type {number}
     */
    index?: number;
    /**
     * object containing given_name and family_name of beneficiary to remove in case of duplicate
     * @type {any}
     */
    to_delete?: any;
    /**
     * id to link duplicate
     *  @type {string}
     */
    id_duplicate?: string;
    /**
     * id uses by the back
     * @type {number}
     */
    id_tmp_cache?: number;


    constructor(instance?) {
        if (instance !== undefined) {
            this.state = instance.state;
            this.new = instance.new;
            this.id_old = instance.id_old;
            this.to_delete = instance.to_delete
            this.id_duplicate = instance.id_duplicate
            this.id_tmp_cache = instance.id_tmp_cache
        }
    }

}

/**
 * Model to format duplicates data before display and verify them
 * Used in step 2
 */
export class FormatDuplicatesData {
    static __classname__ = 'FormatDuplicatesData';
    /**
     * array containing new and old household
     * @type {Array}
     */
    data: Array<any> = [];
    // /**
    //  * new_household to return to back without modification
    //  * @type {Households}
    //  */
    // new_household: Households = new Households;
    // /**
    //  * id uses by the back
    //  * @type {number}
    //  */
    // id_tmp_cache?: number;


    constructor(instance?) {
        if (instance !== undefined) {
            this.data = instance.data;
            this.new_household = instance.new_households;
            this.id_tmp_cache = instance.id_tmp_cache;
        }
    }

    /**
     * Array containing an array with data and new_household keys
     * Key data : array containing an object with old and new household which are one of their beneficiaries identitical
     * Key new_households : data to return to back without modification
     * Used at step 2 : duplicates
     * Get the received instance after send corrected typo issues in parameter
     * @param instance any
     * @param step number
     * @return FormatDuplicatesData
     */
    public static formatDuplicates(instance: any, step: number): FormatDuplicatesData[] {
        let formatDuplicates: FormatDuplicatesData[] = [];
        instance.data.forEach(data => {
            let duplicates = new FormatDuplicatesData;
            duplicates.data = [];
            // duplicates.new_household = data.new_household;
            // if (data.id_tmp_cache) {
            //     duplicates.id_tmp_cache = data.id_tmp_cache
            // }
            duplicates.data.push(FormatDataNewOld.formatDataOldNew(data, step));

            // data.data.forEach(element => {
            // });

            formatDuplicates.push(duplicates);
        });
        return formatDuplicates;
    }

}

/**
 * Model to format more data before display and verify them
 * Used in step 3
 */
export class FormatMore {
    /**
     * id to identify household
     * @type {number}
     */
    id_old: number;
    /**
     * array of beneficiaries object to add in the household
     * @type {Array}
     */
    data: Array<any> = [];
    /**
     * id uses by the back
     * @type {number}
     */
    id_tmp_cache?: number;


    constructor(instance?) {
        if (instance !== undefined) {
            this.id_old = instance.id_old;
            this.data = instance.data;
            this.id_tmp_cache = instance.id_tmp_cache;
        }
    }

}

/**
 * Model to format dless data before display and verify them
 * Used in step 4
 */
export class FormatLess {
    /**
     * id to identify household
     * @type {number}
     */
    id_old: number;
    /**
     * array of id beneficiaries to delete in the database
     * @type {Array}
     */
    data: Array<any> = [];
    /**
     * id uses by the back
     * @type {number}
     */
    id_tmp_cache?: number;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id_old = instance.id_old;
            this.data = instance.data;
            this.id_tmp_cache = instance.id_tmp_cache;
        }
    }

}
