import { GlobalText } from '../../texts/global';
import { Project } from './project.new';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { Location } from './location.new';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { VulnerabilityCriteria } from './vulnerability-criteria.new';

export class Households {

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
                displayFunction: null,
            }
        ),
        dependents: new NumberModelField(
            {
                title: GlobalText.TEXTS.model_beneficiaries_dependents,
                isDisplayedInTable: true,
            }
        ),
        vulnerabilities: new MultipleObjectsModelField<VulnerabilityCriteria>(
            {
                title: GlobalText.TEXTS.model_vulnerabilities,
                isDisplayedInTable: true,
                isImageInTable: true,
            }
        ),
        projectList: new TextModelField (
            {
                title: GlobalText.TEXTS.projects,
                isDisplayedInTable: true,
            }
        )
    };

    public static apiToModel(householdFromApi: any): Households {
        const newHousehold = new Households();

        newHousehold.fields.id.value = householdFromApi.id;

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

        let projectString = '';
        householdFromApi.projects.forEach(project => {
            if (projectString === '') {
                projectString = project.name;
            } else {
                projectString = projectString + ', ' + project.name;
            }
        });
        newHousehold.fields.projectList.value = projectString;

        newHousehold.fields.location.value = Location.apiToModel(householdFromApi.location);
        newHousehold.fields.location.displayFunction = value => value.getLocationName();


        return newHousehold;
    }
}
