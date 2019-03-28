import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { ArrayInputField } from './CustomModel/array-input-field';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';

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
                        id: { value: 0}
                    }},
                    { fields : {
                        name: { value: 'man'},
                        id: { value: 1}
                    }},
                ],
                bindField: 'name',
                apiLabel: 'name',

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
                        name: { value: 'Refugee'},
                        id: { value: 0}
                    }},
                    { fields : {
                        name: { value: 'IDP'},
                        id: { value: 1}
                    }},
                    { fields : {
                        name: { value: 'Resident'},
                        id: { value: 3}
                    }},
                ],
                bindField: 'name',
                apiLabel: 'name',
            }
        ),
        beneficiaryStatus: new BooleanModelField(
            {
                title: GlobalText.TEXTS.model_beneficiaries_status,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isEditable: true,
            }
        ),
        nationalIds: new ArrayInputField<string>(
            {
                title: GlobalText.TEXTS.model_beneficiaries_nationalids,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isEditable: true,
                numberOfInputs: 1,
                value: []
            }
        ),
        phones: new ArrayInputField<string>(
            {
                title: GlobalText.TEXTS.model_beneficiaries_phones,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isEditable: true,
                numberOfInputs: 2,
                value: []
            }
        ),
        vulnerabilities: new MultipleSelectModelField(
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
        )
    };


    public static apiToModel(beneficiaryFromApi: any): Beneficiary {
        const newBeneficiary = new Beneficiary();

        newBeneficiary.fields.id.value = beneficiaryFromApi.id;
        newBeneficiary.fields.givenName.value = beneficiaryFromApi.given_name;
        newBeneficiary.fields.familyName.value = beneficiaryFromApi.family_name;
        newBeneficiary.fields.gender.value = beneficiaryFromApi.gender;
        newBeneficiary.fields.dateOfBirth.value = beneficiaryFromApi.date_of_birth;
        newBeneficiary.fields.residencyStatus.value = beneficiaryFromApi.residency_status;
        newBeneficiary.fields.beneficiaryStatus.value = beneficiaryFromApi.status;
        newBeneficiary.fields.fullName.value = beneficiaryFromApi.given_name + ' ' + beneficiaryFromApi.family_name;

        if (beneficiaryFromApi.national_ids) {
            beneficiaryFromApi.national_ids.forEach(nationalId => {
                newBeneficiary.fields.nationalIds.value.push(nationalId.id_number);
            });
        }
        if (beneficiaryFromApi.phones) {
            beneficiaryFromApi.phones.forEach(phone => {
                newBeneficiary.fields.phones.value.push(phone.number);
            });
        }
        if (beneficiaryFromApi.vulnerability_criteria) {
            beneficiaryFromApi.vulnerability_criteria.forEach(vulnerability => {
                newBeneficiary.fields.vulnerabilities.value.push(vulnerability.field_string);
            });
        }

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
            vulnerability_criteria: this.fields.vulnerabilities.formatForApi(),
            phones: this.fields.phones.formatForApi(),
            national_ids: this.fields.nationalIds.formatForApi(),
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
}
