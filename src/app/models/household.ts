import { AppInjector } from '../app-injector';
import { CountriesService } from '../core/countries/countries.service';
import { UppercaseFirstPipe } from '../shared/pipes/uppercase-first.pipe';
import { Beneficiary } from './beneficiary';
import { LIVELIHOOD } from './constants/livelihood';
import { CountrySpecificAnswer } from './country-specific';
import { CustomModel } from './custom-models/custom-model';
import { MultipleObjectsModelField } from './custom-models/multiple-object-model-field';
import { MultipleSelectModelField } from './custom-models/multiple-select-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { HouseholdLocation } from './household-location';
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
    matSortActive = 'localFamilyName';

    protected countryService = AppInjector.get(CountriesService);

    protected country = this.countryService.selectedCountry.getValue().get<string>('id') ?
    this.countryService.selectedCountry.getValue().get<string>('id') :
    this.countryService.khm.get<string>('id');

    public fields = {
        id: new NumberModelField(
            {
                title: this.language.household_id,
                isDisplayedInTable: true,
            }
        ),
        localFamilyName: new TextModelField(
            {
                title: this.language.beneficiary_family_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
                displayValue: '',
            }
        ),
        localFirstName: new TextModelField(
            {
                title: this.language.beneficiary_given_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
                displayValue: '',
            }
        ),
        enFamilyName: new TextModelField(
            {
                title: this.language.beneficiary_en_family_name,
                placeholder: null,
                isDisplayedInModal: false,
                isDisplayedInTable: false,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        enFirstName: new TextModelField(
            {
                title: this.language.beneficiary_en_given_name,
                placeholder: null,
                isDisplayedInModal: false,
                isDisplayedInTable: false,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        dependents: new NumberModelField(
            {
                title: this.language.household_members,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }
        ),
        vulnerabilities: new MultipleObjectsModelField<VulnerabilityCriteria>(
            {
                title: this.language.beneficiary_vulnerabilities,
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
                apiLabel: 'id',
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
        incomeLevel: new NumberModelField(
            {
                title: this.language.household_income,
                isDisplayedInModal: true,
            }
        ),

        // For now they are never used, set, displayed, or equal to anything other than zero
        longitude: new TextModelField({
            value: '0'
        }),
        latitude: new TextModelField({
            value: '0'
        }),
        currentHouseholdLocation: new ObjectModelField<HouseholdLocation>(
            {
                title: this.language.household_location_current_location,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                displayTableFunction: null,
                displayModalFunction: null,
                tooltip: null
            }
        ),
        residentHouseholdLocation: new ObjectModelField<HouseholdLocation>(
            {
                title: this.language.household_location_resident_location,
                isDisplayedInModal: true,
                displayModalFunction: null,
            }
        ),

    };

    public static apiToModel(householdFromApi: any): Household {
        const newHousehold = new Household();

        newHousehold.set('id', householdFromApi.id);
        newHousehold.set('notes', householdFromApi.notes);
        newHousehold.set('incomeLevel', householdFromApi.income_level);
        newHousehold.set('livelihood',
            householdFromApi.livelihood !== null && householdFromApi.livelihood !== undefined ?
            newHousehold.getOptions('livelihood')
                .filter((livelihood: Livelihood) => livelihood.get('id') === householdFromApi.livelihood.toString())[0] :
            null);

        let dependents: number;
        if (!householdFromApi.number_dependents) {
            dependents = householdFromApi.beneficiaries.length - 1;
        } else {
            dependents = householdFromApi.number_dependents;
        }
        newHousehold.set('dependents', dependents);

        newHousehold.fields.vulnerabilities.displayTableFunction = value => value;
        const pipe = new UppercaseFirstPipe();
        newHousehold.fields.vulnerabilities.displayModalFunction = value => value
            .map((vulnerability: VulnerabilityCriteria) => pipe.transform(vulnerability.get('name'))).join(', ');
        newHousehold.set('projects', householdFromApi.projects.map(project => Project.apiToModel(project)));

        newHousehold.set('beneficiaries', householdFromApi.beneficiaries.map(beneficiary => Beneficiary.apiToModel(beneficiary)));
        newHousehold.get<Beneficiary[]>('beneficiaries').forEach((beneficiary: Beneficiary) => {
            if (beneficiary.get('beneficiaryStatus').get<string>('id') === '1') {
                newHousehold.set('localFamilyName', beneficiary.get<string>('localFamilyName'));
                newHousehold.set('localFirstName', beneficiary.get<string>('localGivenName'));
                newHousehold.fields.localFamilyName.displayValue = beneficiary.fields.localFamilyName.displayValue;
                newHousehold.fields.localFirstName.displayValue = beneficiary.fields.localGivenName.displayValue;
                newHousehold.set('enFamilyName', beneficiary.get<string>('enFamilyName'));
                newHousehold.set('enFirstName', beneficiary.get<string>('enGivenName'));
            }
            beneficiary.get<VulnerabilityCriteria[]>('vulnerabilities').forEach((vulnerability: VulnerabilityCriteria) => {
                newHousehold.add('vulnerabilities', vulnerability);
            });
        });


        newHousehold.set('countrySpecificAnswers', householdFromApi.country_specific_answers ?
        householdFromApi.country_specific_answers.map(
            countrySpecificAnswer => CountrySpecificAnswer.apiToModel(countrySpecificAnswer)
        )
        : null);

        const householdLocations = householdFromApi.household_locations ?
            householdFromApi.household_locations.map((householdLocation: any) => HouseholdLocation.apiToModel(householdLocation))
            : null;

        const currentHouseholdLocation = householdLocations.filter((householdLocation: HouseholdLocation) =>
            householdLocation.get('locationGroup').get<string>('id') === 'current');
        const residentHouseholdLocation = householdLocations.filter((householdLocation: HouseholdLocation) =>
            householdLocation.get('locationGroup').get<string>('id') === 'resident');

        newHousehold.set('currentHouseholdLocation', currentHouseholdLocation.length > 0 ? currentHouseholdLocation[0] : null);
        newHousehold.set('residentHouseholdLocation', residentHouseholdLocation.length > 0 ? residentHouseholdLocation[0] : null);

        newHousehold.fields.currentHouseholdLocation.displayTableFunction = (value: HouseholdLocation) => {
            return value.getHouseholdPreciseLocationName();
        };
        newHousehold.fields.currentHouseholdLocation.displayModalFunction = (value: HouseholdLocation) => value.getHouseholdLocationName();
        newHousehold.fields.currentHouseholdLocation.tooltip = (value: HouseholdLocation) => value.getHouseholdLocationName();
        newHousehold.fields.residentHouseholdLocation.displayModalFunction = (value: HouseholdLocation) =>
            value ? value.getHouseholdLocationName() : null;

        return newHousehold;
    }

    public getIdentifyingName() {
        return this.language.household_sentence + this.get('localFirstName') + ' ' + this.get('localFamilyName');
    }


    public modelToApi(): Object {

        const householdLocations = [this.get<HouseholdLocation>('currentHouseholdLocation')];
        if (this.get<HouseholdLocation>('residentHouseholdLocation')) {
            householdLocations.push(this.get<HouseholdLocation>('residentHouseholdLocation'));
        }

        return {
            livelihood: this.get('livelihood') ? this.get('livelihood').get('id') : null,
            longitude: this.get('longitude'),
            latitude: this.get('latitude'),
            notes: this.get('notes'),
            country_specific_answers: this.get<CountrySpecificAnswer[]>('countrySpecificAnswers').map(answer => answer.modelToApi()),
            beneficiaries: this.get<Beneficiary[]>('beneficiaries').map(beneficiary => beneficiary.modelToApi()),
            income_level: this.get('incomeLevel'),
            household_locations: householdLocations.map((householdLocation: HouseholdLocation) => householdLocation.modelToApi()),
        };
    }
}
