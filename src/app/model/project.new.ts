import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { DateModelField } from './CustomModel/date-model-field';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Donor } from './donor.new';
import { Sector } from './sector.new';


export class Project extends CustomModel {

    public static rights = ['ROLE_ADMIN', 'ROLE_COUNTRY_MANAGER', 'ROLE_PROJECT_MANAGER'];

    title = GlobalText.TEXTS.project;


    public fields = {
        id : new NumberModelField(
            {
                title: null,
                placeholder: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
            },
        ),
        name : new TextModelField(
            {
                title: GlobalText.TEXTS.model_project_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        sectors : new MultipleSelectModelField (
            {
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                title: GlobalText.TEXTS.model_sectors_name,
                isSettable: true,
                options: undefined,
                bindField: 'name',
                isImageInTable: true,
                isEditable: true,
                value: [],
                apiLabel: 'id'
            }
        ),
        startDate : new DateModelField(
            {
                title: GlobalText.TEXTS.model_project_start_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                // Today
                value: this.getDateOffset(0, 0, 0),
                isEditable: true,
            }
        ),
        endDate : new DateModelField(
            {
                title: GlobalText.TEXTS.model_project_end_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                // Today in three days
                value: this.getDateOffset(0, 3, 0),
                isEditable: true,
            }
        ),
        // Todo: check if this is necessary ?
        numberOfHouseholds : new NumberModelField(
            {
                title: GlobalText.TEXTS.model_project_number_of_households,
                placeholder: null,
                isDisplayedInModal: false,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
            }
        ),
        donors : new MultipleSelectModelField (
            {
                title: GlobalText.TEXTS.model_project_donors_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                isSettable: true,
                options: undefined,
                bindField: 'shortname',
                isEditable: true,
                value: [],
                apiLabel: 'id',
            }
        ),
        iso3 : new TextModelField(
            {
                title: null,
                placeholder: null,
                isDisplayedInModal: false,
                isLongText: false,
            }
        ),
        value : new NumberModelField(
            {
                title: GlobalText.TEXTS.model_project_value,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInSummary: true,
                isDisplayedInModal: true,
                isEditable: true,
            }
        ),
        reachedBeneficiaries: new NumberModelField ({
                title: GlobalText.TEXTS.add_distribution_beneficiaries_reached,
                placeholder: null,
                isRequired: false,
                isSettable: false,
                isDisplayedInSummary: true,
                isDisplayedInModal: false,
                isEditable: false,
            }
        ),
        notes : new TextModelField(
            {
                title: GlobalText.TEXTS.model_notes,
                placeholder: null,
                isSettable: true,
                isUpdatable: true,
                isDisplayedInModal: true,
                isLongText: true,
                isEditable: true,
            }
        ),
    };


    public static apiToModel(projectFromApi: any): object {
        const newProject = new Project();

        // Assign default fields
        newProject.fields.id.value = projectFromApi.id;
        newProject.fields.name.value = projectFromApi.name;
        newProject.fields.startDate.value = projectFromApi.start_date;
        newProject.fields.endDate.value = projectFromApi.end_date;
        newProject.fields.numberOfHouseholds.value = projectFromApi.number_of_households;
        newProject.fields.iso3.value = projectFromApi.iso3;
        newProject.fields.value.value = projectFromApi.value;
        newProject.fields.notes.value = projectFromApi.notes;

        // Assign select fields
        newProject.fields.sectors.value = projectFromApi.sectors ?
            projectFromApi.sectors.map((sector: object) => {
                return Sector.apiToModel(sector);
            }) :
            [];

        newProject.fields.donors.value = projectFromApi.donors ?
            projectFromApi.donors.map((donor: object) => {
            return Donor.apiToModel(donor);
            }) :
            [];

        // Move to distributions.new.ts
        const reachedBeneficiaries = [];
        if (projectFromApi.distributions) {
            projectFromApi.distributions.forEach(distribution => {
                distribution.distribution_beneficiaries.forEach(distributionBeneficiary => {
                    reachedBeneficiaries.push(distributionBeneficiary.beneficiary.id);
                });
            });
        }
        const uniqueReachedBeneficiaries = reachedBeneficiaries ? [new Set(reachedBeneficiaries)] : [];
        newProject.fields.reachedBeneficiaries.value = uniqueReachedBeneficiaries[0].size;
        return newProject;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            name: this.fields.name.formatForApi(),
            start_date: this.fields.startDate.formatForApi(),
            end_date: this.fields.endDate.formatForApi(),
            number_of_households: this.fields.numberOfHouseholds.formatForApi(),
            iso3: this.fields.iso3.formatForApi(),
            value: this.fields.value.formatForApi(),
            notes: this.fields.notes.formatForApi(),
            sectors: this.fields.sectors.formatForApi(),
            donors: this.fields.donors.formatForApi(),
        };
    }

}
