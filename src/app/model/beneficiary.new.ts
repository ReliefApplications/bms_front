import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { ArrayInputField } from './CustomModel/array-input-field';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { Phone } from './phone.new';
import { ObjectModelField } from './CustomModel/object-model-field';
import { NationalId } from './nationalId.new';
import { VulnerabilityCriteria } from './vulnerability-criteria.new';
import { Profile } from './profile.new';
export class Beneficiary extends CustomModel {
    title = GlobalText.TEXTS.beneficiary;

    public fields = {
        id : new NumberModelField(
            {
                title: null,
                placeholder: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
            },
        ),
        givenName: new TextModelField(
            {
                title: GlobalText.TEXTS.model_firstName,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        familyName: new TextModelField(
            {
                title: GlobalText.TEXTS.model_familyName,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        gender: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.gender,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isEditable: true,
                options: [
                    { fields : {
                        name: { value: 'woman'},
                        id: { value: '0'}
                    }},
                    { fields : {
                        name: { value: 'man'},
                        id: { value: '1'}
                    }},
                ],
                bindField: 'name',
                apiLabel: 'id',

            }
        ),
        dateOfBirth: new DateModelField({
            title: GlobalText.TEXTS.model_dateofbirth,
            placeholder: null,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isRequired: true,
            isSettable: true,
            isEditable: true,

        }),
        residencyStatus: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.model_residencystatus,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
                options: [
                    { fields : {
                        name: { value: 'refugee'},
                        id: { value: '0'}
                    }},
                    { fields : {
                        name: { value: 'IDP'},
                        id: { value: '1'}
                    }},
                    { fields : {
                        name: { value: 'resident'},
                        id: { value: '2'}
                    }},
                ],
                bindField: 'name',
                apiLabel: 'name',
                value: { fields : {
                    name: { value: 'resident'},
                    id: { value: '2'}
                }}
            }
        ),
        beneficiaryStatus: new NumberModelField(
            {
                title: GlobalText.TEXTS.model_beneficiaries_status,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isEditable: true,
            }
        ),
        nationalIds: new MultipleObjectsModelField<NationalId>(
            {
                title: GlobalText.TEXTS.model_beneficiaries_nationalids,
                isDisplayedInModal: false,
                isDisplayedInTable: false,
                value: []
            }
        ),
        phones: new MultipleObjectsModelField<Phone>(
            {
                title: GlobalText.TEXTS.model_beneficiaries_phones,
                isDisplayedInModal: false,
                isDisplayedInTable: false,
                isRequired: true,
                isSettable: true,
                isEditable: true,
                value: []
            }
        ),
        vulnerabilities: new MultipleObjectsModelField<VulnerabilityCriteria>(
            {
                title: GlobalText.TEXTS.model_vulnerabilities,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isSettable: true,
                isImageInTable: true,
                options: undefined,
                bindField: 'name',
                isEditable: true,
                value: [],
                apiLabel: 'name',
            }
        ),
        fullName: new TextModelField(
            {
                title: GlobalText.TEXTS.model_donor_fullname,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        profile: new ObjectModelField<Profile>({

        })
    };


    public static apiToModel(beneficiaryFromApi: any): Beneficiary {
        const newBeneficiary = new Beneficiary();

        newBeneficiary.fields.id.value = beneficiaryFromApi.id;
        newBeneficiary.fields.givenName.value = beneficiaryFromApi.given_name;
        newBeneficiary.fields.familyName.value = beneficiaryFromApi.family_name;
        newBeneficiary.fields.dateOfBirth.value = new Date(beneficiaryFromApi.date_of_birth);
        newBeneficiary.fields.beneficiaryStatus.value = beneficiaryFromApi.status;
        newBeneficiary.fields.fullName.value = beneficiaryFromApi.given_name + ' ' + beneficiaryFromApi.family_name;

        newBeneficiary.fields.residencyStatus.value = beneficiaryFromApi.residency_status ?
            newBeneficiary.fields.residencyStatus.options.filter(
                option => option.fields.name.value === beneficiaryFromApi.residency_status)[0] :
            newBeneficiary.fields.residencyStatus.value;

        newBeneficiary.fields.gender.value = beneficiaryFromApi.gender !== null && beneficiaryFromApi.gender !== undefined ?
            newBeneficiary.fields.gender.options.filter(option => option.fields.id.value === beneficiaryFromApi.gender.toString())[0] :
            null;

        newBeneficiary.fields.nationalIds.value =
            beneficiaryFromApi.national_ids && beneficiaryFromApi.national_ids.length !== 0 ?
            beneficiaryFromApi.national_ids.map(nationalId => NationalId.apiToModel(nationalId)) :
            [new NationalId()];


        // if (beneficiaryFromApi.national_ids && beneficiaryFromApi.national_ids.length !== 0) {
        //     beneficiaryFromApi.national_ids.forEach(nationalId => {
        //         newBeneficiary.fields.nationalIds.value.push(NationalId.apiToModel(nationalId));
        //     });
        // } else {
        //     newBeneficiary.fields.nationalIds.value = [new NationalId()]
        // }

        newBeneficiary.fields.phones.value =
            beneficiaryFromApi.phones && beneficiaryFromApi.phones.length !== 0 ?
            beneficiaryFromApi.phones.map(phone => Phone.apiToModel(phone)) :
            [new Phone(), new Phone()];

        if (newBeneficiary.fields.phones.value.length === 1) {
            newBeneficiary.fields.phones.value.push(new Phone());
        }


        newBeneficiary.fields.vulnerabilities.value =
            beneficiaryFromApi.vulnerability_criteria ?
            beneficiaryFromApi.vulnerability_criteria.map(criteria => VulnerabilityCriteria.apiToModel(criteria)) :
            [];

        // if (beneficiaryFromApi.phones && beneficiaryFromApi.phones.length !== 0) {
        //     beneficiaryFromApi.phones.forEach(phone => {
        //         newBeneficiary.fields.phones.value.push(Phone.apiToModel(phone));
        //     });
        //     if (newBeneficiary.fields.phones.value.length === 1) {
        //         newBeneficiary.fields.phones.value.push(new Phone());
        //     }
        // } else {
        //     newBeneficiary.fields.phones.value = [new Phone(), new Phone()]
        // }
        // if (beneficiaryFromApi.vulnerability_criteria) {
        //     beneficiaryFromApi.vulnerability_criteria.forEach(vulnerability => {
        //         newBeneficiary.fields.vulnerabilities.value.push(VulnerabilityCriteria.apiToModel(vulnerability));
        //     });
        // }

        newBeneficiary.fields.profile.value = beneficiaryFromApi.profile ? Profile.apiToModel(beneficiaryFromApi.profile) : new Profile();

        return newBeneficiary;

    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            given_name: this.fields.givenName.formatForApi(),
            family_name: this.fields.familyName.formatForApi(),
            gender: this.fields.gender.formatForApi(),
            date_of_birth: this.fields.dateOfBirth.formatForApi(),
            residency_status: this.fields.residencyStatus.formatForApi(),
            status: this.fields.beneficiaryStatus.formatForApi(),
            vulnerability_criteria: this.fields.vulnerabilities.value.map(vulnerability => vulnerability.modelToApi()),
            phones: this.fields.phones.value.map(phone => phone.modelToApi()),
            national_ids: this.fields.nationalIds.value.map(nationalId => nationalId.modelToApi()),
            profile: this.fields.profile.value ? this.fields.profile.value.modelToApi() : null
        };
    }

    public  mapVulnerability(name: string): string {
        if (!name) {
            return '';
        }
        switch (name) {
            case 'pregnant':
                name = 'assets/images/households/pregnant.png';
                break;
            case 'disabled':
                name = 'assets/images/households/disabled.png';
                break;
            case 'lactating':
                name = 'assets/images/households/lactating.png';
                break;
            case 'solo parent':
                name = 'assets/images/households/solo-parent.png';
                break;
            case 'nutritional issues':
                name = 'assets/images/households/nutritional-issues.png';
                break;
            default: return name;
        }
        return name;
    }

    public getIdentifyingName() {
        return this.fields.givenName.value + ' ' + this.fields.familyName.value;
    }
}
