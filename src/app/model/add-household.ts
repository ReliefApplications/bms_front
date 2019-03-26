import { CountrySpecificAnswer } from './country-specific';
import { VulnerabilityCriteria } from './vulnerability-criteria';
import { Location } from './location';

export class Profile {
    static __classname__ = 'Profile';
    /**
     * photo
     * @type {string}
     */
    photo = '';
}

export class Phones {
    static __classname__ = 'Phones';
    /**
     * number
     * @type {string}
     */
    number = '';
    /**
     * type of number
     * @type {string}
     */
    type = 'type1';
}

export class NationalID {
    static __classname__ = 'NationalID';
    /**
    * number
    * @type {string}
    */
    id_number = '';
    /**
     * type of number
     * @type {string}
     */
    id_type = 'ID Card';
}

export class AddHouseholds {
    static __classname__ = 'AddHouseholds';
    /**
     * Households' address_street
     * @type {string}
     */
    address_street = '';
    /**
    * Households' address_number
    * @type {string}
    */
    address_number = '';
    /**
     * Households' address_postcode
     * @type {string}
     */
    address_postcode = '';
    /**
     * Households' livelihood
     * @type {number}
     */
    livelihood = 0;
    /**
    * Households' notes
    * @type {string}
    */
    notes = '';
    /**
     * Households' longitude
     * @type {string}
     */
    longitude = '0';
    /**
     * Households' latitude
     * @type {string}
     */
    latitude = '0';
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
    family_name = '';
    /**
     *  firstName
     * @type {string}
     */
    given_name = '';
    /**
     * gender
     * @type {number}
     */
    gender: number;
    /**
     *  familyName
     * @type {string}
     */
    status = '';
    /**
     *  firstName
     * @type {string}
     */
    date_of_birth = '';
    /**
     * gender
     * @type {Date}
     */
    updated_on: Date = new Date;
    /**
     * profile
     * @type {Profile}
     */
    profile: Profile = new Profile;
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
