import { GlobalText } from '../../texts/global';
import { Project } from './project.new';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { Location } from './location.new';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { VulnerabilityCriteria } from './vulnerability-criteria.new';
import { Beneficiary } from './beneficiary.new';
import { CountrySpecific } from './country-specific.new';
import { CustomModel } from './CustomModel/custom-model';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { ThousandsPipe } from '../core/utils/thousands.pipe';
import { CountrySpecificAnswer } from './country-specific.new';
import { LIVELIHOOD } from './livelihood';

export class Livelihood extends CustomModel {

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
export class Households extends CustomModel {

    title = GlobalText.TEXTS.households;

    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
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
        firstName: new TextModelField(
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
        location: new ObjectModelField<Location> (
            {
                title: GlobalText.TEXTS.location,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                displayTableFunction: null,
                displayModalFunction: null,
            }
        ),
        dependents: new NumberModelField(
            {
                title: GlobalText.TEXTS.model_beneficiaries_dependents,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }
        ),
        vulnerabilities: new MultipleObjectsModelField<VulnerabilityCriteria>(
            {
                title: GlobalText.TEXTS.model_vulnerabilities,
                isDisplayedInTable: true,
                isImageInTable: true,
                value: [],
                isDisplayedInModal: true,
                displayModalFunction: null,
                displayTableFunction: null,
            }
        ),
        projects: new MultipleSelectModelField (
            {
                title: GlobalText.TEXTS.projects,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                bindField: 'name',
                value: [],
                apiLabel: 'id'
            }
        ),
        beneficiaries: new MultipleObjectsModelField<Beneficiary>(
            {
                value: []
            }
        ),
        countrySpecificAnswers: new MultipleObjectsModelField<CountrySpecificAnswer>(
            {
                value: []
            }
        ),
        addressNumber: new NumberModelField({

        }),
        addressPostcode: new TextModelField({

        }),
        addressStreet: new TextModelField({

        }),
        livelihood: new SingleSelectModelField(
            {
                options: LIVELIHOOD.map(livelihood => new Livelihood(livelihood.id, livelihood.name))
            }
        ),
        notes: new TextModelField(
            {
                isLongText: true
            }
        ),

        // For now they are never used, set, displayed, or equal to anything other than zero
        longitude: new TextModelField({
            value: '0'
        }),
        latitude: new TextModelField({
            value: '0'
        }),

    };

    public static apiToModel(householdFromApi: any): Households {
        const newHousehold = new Households();

        newHousehold.set('id', householdFromApi.id);
        newHousehold.set('addressNumber', householdFromApi.address_number);
        newHousehold.set('addressPostcode', householdFromApi.address_postcode);
        newHousehold.set('addressStreet', householdFromApi.address_street);
        newHousehold.set('notes', householdFromApi.notes);
        newHousehold.set('livelihood',
            householdFromApi.livelihood ?
            newHousehold.getOptions('livelihood')
                .filter((livelihood: Livelihood) => livelihood.get('id') === householdFromApi.livelihood.toString())[0] :
            null);

        let dependents: number;
        if (householdFromApi.number_dependents == null) {
            dependents = householdFromApi.beneficiaries.length;
        } else {
            dependents = householdFromApi.number_dependents;
        }
        newHousehold.set('dependents', dependents);

        householdFromApi.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status === true) {
                newHousehold.set('familyName', beneficiary.family_name);
                newHousehold.set('firstName', beneficiary.given_name);
            }
            beneficiary.vulnerability_criteria.forEach(vulnerability => {
                newHousehold.add('vulnerabilities', VulnerabilityCriteria.apiToModel(vulnerability));
            });
        });
        newHousehold.fields.vulnerabilities.displayTableFunction = value => this.displayTableVulnerabilities(value);
        newHousehold.fields.vulnerabilities.displayModalFunction = value => this.displayModalVulnerabilities(value);
        newHousehold.set('projects', householdFromApi.projects.map(project => Project.apiToModel(project)));
        newHousehold.set('location', Location.apiToModel(householdFromApi.location));
        newHousehold.fields.location.displayTableFunction = value => value.getLocationName();
        newHousehold.fields.location.displayModalFunction = value => value.getLocationName();

        newHousehold.set('beneficiaries', householdFromApi.beneficiaries.map(beneficiary => Beneficiary.apiToModel(beneficiary)));
        newHousehold.set('countrySpecificAnswers', householdFromApi.country_specific_answers ?
        householdFromApi.country_specific_answers.map(
            countrySpecificAnswer => CountrySpecificAnswer.apiToModel(countrySpecificAnswer)
        )
        : null);

        return newHousehold;
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

    public static displayModalVulnerabilities(value) {
        let vulnerabilityNames = '';
        value.forEach((vulnerability: VulnerabilityCriteria, index: number) => {
            const name = vulnerability.fields.name.value;
            if (!vulnerabilityNames.includes(name)) {
                vulnerabilityNames += index === 0 ? name : ', ' + name;
            }
        });
        return vulnerabilityNames;
    }

    public getIdentifyingName() {
        return this.get('firstName') + ' ' + this.get('familyName');
    }


    public modelToApi(): Object {
        return {
            address_number: this.get('addressNumber'),
            address_street: this.get('addressStreet'),
            address_postcode: this.get('addressPostcode'),
            livelihood: this.get('livelihood') ? this.get('livelihood').get('id') : null,
            longitude: this.get('longitude'),
            latitude: this.get('latitude'),
            notes: this.get('notes'),
            location: this.get('location').modelToApi(),
            country_specific_answers: this.get<CountrySpecificAnswer[]>('countrySpecificAnswers').map(answer => answer.modelToApi()),
            beneficiaries: this.get<Beneficiary[]>('beneficiaries').map(beneficiary => beneficiary.modelToApi())
        };
    }

}
