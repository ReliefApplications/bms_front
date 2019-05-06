import { Beneficiary } from './beneficiary';
import { CountrySpecificAnswer } from './country-specific';
import { CustomModel } from './CustomModel/custom-model';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { LIVELIHOOD } from './livelihood';
import { Location } from './location';
import { Project } from './project';
import { VulnerabilityCriteria } from './vulnerability-criteria';

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
export class Household extends CustomModel {

    title = this.language.households;
    matSortActive = 'familyName';

    public fields = {
        id: new NumberModelField(
            {
                title: this.language.id,
                isDisplayedInTable: true,
            }
        ),
        familyName: new TextModelField(
            {
                title: this.language.model_familyName,
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
                title: this.language.model_firstName,
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
                title: this.language.location,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                displayTableFunction: null,
                displayModalFunction: null,
            }
        ),
        dependents: new NumberModelField(
            {
                title: this.language.model_beneficiaries_dependents,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }
        ),
        vulnerabilities: new MultipleObjectsModelField<VulnerabilityCriteria>(
            {
                title: this.language.model_vulnerabilities,
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
                title: this.language.projects,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isRequired: true,
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
            title: this.language.add_beneficiary_getAddressNumber,
        }),
        addressPostcode: new TextModelField({
            title: this.language.add_beneficiary_getAddressPostcode,
        }),
        addressStreet: new TextModelField({
            title: this.language.add_beneficiary_getAddressStreet,
        }),
        livelihood: new SingleSelectModelField(
            {
                options: LIVELIHOOD.map(livelihood => new Livelihood(livelihood.id, this.language[livelihood.language_key]))
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

    public static apiToModel(householdFromApi: any): Household {
        const newHousehold = new Household();

        newHousehold.set('id', householdFromApi.id);
        newHousehold.set('addressNumber', householdFromApi.address_number);
        newHousehold.set('addressPostcode', householdFromApi.address_postcode);
        newHousehold.set('addressStreet', householdFromApi.address_street);
        newHousehold.set('notes', householdFromApi.notes);
        newHousehold.set('livelihood',
            householdFromApi.livelihood !== null && householdFromApi.livelihood !== undefined ?
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
        newHousehold.fields.vulnerabilities.displayTableFunction = value => value;
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

    public static displayModalVulnerabilities(value) {
        let vulnerabilityNames = '';
        value.forEach((vulnerability: VulnerabilityCriteria, index: number) => {
            const name = vulnerability.get<string>('name');
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
