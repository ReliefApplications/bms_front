import { CountrySpecificAnswer } from "./country-specific";
import { VulnerabilityCriteria } from "./vulnerability_criteria";
import { Location } from "./location";

export class AddHouseholds {
    static __classname__ = 'AddHouseholds';
    /**
     * Households' address_street
     * @type {string}
     */
    address_street: string = '';
    /**
    * Households' address_number
    * @type {string}
    */
    address_number: string = '';
    /**
     * Households' address_postcode
     * @type {string}
     */
    address_postcode: string = '';
    /**
     * Households' livelihood
     * @type {string}
     */
    livelihood: string = '';
    /**
    * Households' notes
    * @type {string}
    */
    notes: string = '';
    /**
     * Households' longitude
     * @type {string}
     */
    longitude: string = '0';
    /**
     * Households' latitude
     * @type {string}
     */
    latitude: string = '0';
    /**
     * Household's location
     * @type {Location}
     */
    location: Location = new Location;
    /**
     * Country specific answer
     * @type {Array}
     */
    country_specific_answers: Array<CountrySpecificAnswer> = [];
    /**
     * Beneficiaries
     * @type {Array}
     */
    beneficiaries: Array<AddBeneficiaries> = [];

}

export class AddBeneficiaries {
    static __classname__ = 'AddBeneficiaries';
    /**
     *  familyName
     * @type {string}
     */
    family_name: string = '';
    /**
     *  firstName
     * @type {string}
     */
    given_name: string = '';
    /**
     * gender
     * @type {number}
     */
    gender: number;
    /**
     *  familyName
     * @type {string}
     */
    status: string = '';
    /**
     *  firstName
     * @type {string}
     */
    date_of_birth: string = '';
    /**
     * gender
     * @type {Date}
     */
    updated_on: Date = new Date;
    /**
     * profile
     * @type {Profile}
     */
    profile: Profile;
    /**
     * Vulnerabilities criteria
     * @type {Array}
     */
    vulnerability_criteria: Array<VulnerabilityCriteria> = [];
    /**
     * phones
     * @type {Array}
     */
    phones: Array<Phones> = [];
    /**
     * national ID
     * @type {Array}
     */
    national_ids: Array<NationalID> = [];
    /**
     * id_beneficiary
     * @type {string}
     */
    id: string;

}

export class Profile {
    static __classname__ = 'Profile';
    /**
     * photo
     * @type {string}
     */
    photo: string = "";
}

export class Phones {
    static __classname__ = 'Phones';
    /**
     * number 
     * @type {string}
     */
    number: string = '';
    /**
     * type of number
     * @type {string}
     */
    type: string = 'type1';
}

export class NationalID {
    static __classname__ = 'NationalID';
    /**
    * number 
    * @type {string}
    */
    id_number: string = '';
    /**
     * type of number
     * @type {string}
     */
    id_type: string = 'card';
}