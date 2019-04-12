import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { Phone } from './phone.new';
import { ObjectModelField } from './CustomModel/object-model-field';
import { NationalId } from './nationalId.new';
import { VulnerabilityCriteria } from './vulnerability-criteria.new';
import { Profile } from './profile.new';

export class Gender extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class ResidencyStatus extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}
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
                isDisplayedInTable: true,
                isEditable: true,
                options: [ new Gender('0', 'woman'), new Gender('1', 'man')],
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
                options: [ new ResidencyStatus('0', 'refugee'), new ResidencyStatus('1', 'IDP'), new ResidencyStatus('2', 'resident')],
                bindField: 'name',
                apiLabel: 'name',
                value: new ResidencyStatus('2', 'resident')
            }
        ),
        beneficiaryStatus: new NumberModelField(
            {
                title: GlobalText.TEXTS.model_beneficiaries_status,
                isDisplayedInModal: true,
                isDisplayedInTable: false,
                isRequired: true,
                isSettable: true,
                isEditable: true,
            }
        ),
        nationalIds: new MultipleObjectsModelField<NationalId>(
            {
                title: GlobalText.TEXTS.model_beneficiaries_nationalids,
                isDisplayedInModal: true,
                isDisplayedInTable: false,
                displayTableFunction: null,
                displayModalFunction: null,
                value: []
            }
        ),
        phones: new MultipleObjectsModelField<Phone>(
            {
                title: GlobalText.TEXTS.phone,
                isDisplayedInModal: true,
                isDisplayedInTable: false,
                displayTableFunction: null,
                displayModalFunction: null,
                nullValue: 'none',
                value: []
            }
        ),
        vulnerabilities: new MultipleObjectsModelField<VulnerabilityCriteria>(
            {
                title: GlobalText.TEXTS.model_vulnerabilities,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isImageInTable: true,
                displayTableFunction: null,
                displayModalFunction: null,
                value: []
            }
        ),
        fullName: new TextModelField(
            {
                title: GlobalText.TEXTS.model_donor_fullname,
                placeholder: null,
                isDisplayedInModal: false,
                isDisplayedInTable: false,
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

        newBeneficiary.set('id', beneficiaryFromApi.id);
        newBeneficiary.set('givenName', beneficiaryFromApi.given_name);
        newBeneficiary.set('familyName', beneficiaryFromApi.family_name);
        newBeneficiary.set('dateOfBirth', beneficiaryFromApi.date_of_birth ? new Date(beneficiaryFromApi.date_of_birth) : null);
        newBeneficiary.set('beneficiaryStatus', beneficiaryFromApi.status);
        newBeneficiary.set('fullName',
        beneficiaryFromApi.given_name ? beneficiaryFromApi.given_name : null + ' ' +
        beneficiaryFromApi.family_name ? beneficiaryFromApi.family_name : null);

        newBeneficiary.set('residencyStatus',
            beneficiaryFromApi.residency_status ?
            newBeneficiary.getOptions('residencyStatus')
                .filter((option: ResidencyStatus) => option.get('name') === beneficiaryFromApi.residency_status)[0] :
            newBeneficiary.get('residencyStatus'));

        newBeneficiary.set('gender',
            beneficiaryFromApi.gender >= 0 ?
            newBeneficiary.getOptions('gender').filter((option: Gender) => option.get('id') === beneficiaryFromApi.gender.toString())[0] :
            null);

        newBeneficiary.set('nationalIds',
            beneficiaryFromApi.national_ids && beneficiaryFromApi.national_ids.length !== 0 ?
            beneficiaryFromApi.national_ids.map(nationalId => NationalId.apiToModel(nationalId)) :
            [new NationalId()]);

        newBeneficiary.set('phones',
            beneficiaryFromApi.phones && beneficiaryFromApi.phones.length !== 0 ?
            beneficiaryFromApi.phones.map(phone => Phone.apiToModel(phone)) :
            [new Phone(), new Phone()]);

        if (newBeneficiary.get<Phone[]>('phones').length === 1) {
            newBeneficiary.get<Phone[]>('phones').push(new Phone());
        }

        newBeneficiary.set('vulnerabilities',
            beneficiaryFromApi.vulnerability_criteria ?
            beneficiaryFromApi.vulnerability_criteria.map(criteria => VulnerabilityCriteria.apiToModel(criteria)) :
            []);

        newBeneficiary.set('profile', beneficiaryFromApi.profile ? Profile.apiToModel(beneficiaryFromApi.profile) : new Profile());


        newBeneficiary.fields.vulnerabilities.displayTableFunction = value => this.displayTableVulnerabilities(value);
        newBeneficiary.fields.vulnerabilities.displayModalFunction =
            value => value.map((vulnerability: VulnerabilityCriteria) => vulnerability.get('name'));
        newBeneficiary.fields.phones.displayTableFunction = value => value.map((phone: Phone) => phone.get('number'));
        newBeneficiary.fields.phones.displayModalFunction = value => value.map((phone: Phone) => phone.get('number'));
        newBeneficiary.fields.nationalIds.displayModalFunction = value => value.map((nationalId: NationalId) => nationalId.get('number'));

        return newBeneficiary;

    }

    public static displayTableVulnerabilities(value) {
        const images = [];
        value.forEach((vulnerability: VulnerabilityCriteria) => {
            const image = vulnerability.getImage();
            if (!images.includes(image)) {
                images.push(image);
            }
        });
        return images;
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
            vulnerability_criteria: this.get<VulnerabilityCriteria[]>('vulnerabilities').map(vulnerability => vulnerability.modelToApi()),
            phones: this.get<Phone[]>('phones').map(phone => phone.modelToApi()),
            national_ids: this.get<NationalId[]>('nationalIds').map(nationalId => nationalId.modelToApi()),
            profile: this.get('profile') ? this.get('profile').modelToApi() : null
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
        return this.get('givenName') + ' ' + this.get('familyName');
    }


}



