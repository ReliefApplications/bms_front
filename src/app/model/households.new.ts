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

        newHousehold.fields.id.value = householdFromApi.id;
        newHousehold.fields.addressNumber.value = householdFromApi.address_number;
        newHousehold.fields.addressPostcode.value = householdFromApi.address_postcode;
        newHousehold.fields.addressStreet.value = householdFromApi.address_street;
        newHousehold.fields.notes.value = householdFromApi.notes;
        newHousehold.fields.livelihood.value =
            householdFromApi.livelihood ?
            LIVELIHOOD.filter(livelihood => livelihood.id === householdFromApi.livelihood + 1)[0] :
            null;

        let dependents: number;
        if (householdFromApi.number_dependents == null) {
            dependents = householdFromApi.beneficiaries.length;
        } else {
            dependents = householdFromApi.number_dependents;
        }
        newHousehold.fields.dependents.value = dependents;

        householdFromApi.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status === true) {
                newHousehold.fields.familyName.value = beneficiary.family_name;
                newHousehold.fields.firstName.value = beneficiary.given_name;
            }
            beneficiary.vulnerability_criteria.forEach(vulnerability => {
                newHousehold.fields.vulnerabilities.value.push(VulnerabilityCriteria.apiToModel(vulnerability));
            });
        });
        newHousehold.fields.vulnerabilities.displayTableFunction = value => this.displayTableVulnerabilities(value);
        newHousehold.fields.vulnerabilities.displayModalFunction = value => this.displayModalVulnerabilities(value);
        newHousehold.fields.projects.value = householdFromApi.projects.map(project => Project.apiToModel(project));
        newHousehold.fields.location.value = Location.apiToModel(householdFromApi.location);
        newHousehold.fields.location.displayTableFunction = value => value.getLocationName();
        newHousehold.fields.location.displayModalFunction = value => value.getLocationName();

        newHousehold.fields.beneficiaries.value = householdFromApi.beneficiaries.map(beneficiary => Beneficiary.apiToModel(beneficiary));
        newHousehold.fields.countrySpecificAnswers.value = householdFromApi.country_specific_answers ?
        householdFromApi.country_specific_answers.map(
            countrySpecificAnswer => CountrySpecificAnswer.apiToModel(countrySpecificAnswer)
        )
        : null;

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
        return this.fields.firstName.value + ' ' + this.fields.familyName.value;
    }


    public modelToApi(): Object {
        return {
            address_number: this.fields.addressNumber.value,
            address_street: this.fields.addressStreet.value,
            address_postcode: this.fields.addressPostcode.value,
            livelihood: this.fields.livelihood.value ? this.fields.livelihood.value.id - 1 : null,
            longitude: this.fields.longitude.value,
            latitude: this.fields.latitude.value,
            notes: this.fields.notes.value,
            location: this.fields.location.value.modelToApi(),
            country_specific_answers: this.fields.countrySpecificAnswers.value.map(answer => answer.modelToApi()),
            beneficiaries: this.fields.beneficiaries.value.map(beneficiary => beneficiary.modelToApi())
        };
    }

    // In modelToApi, do livelihoodId - 1
}
