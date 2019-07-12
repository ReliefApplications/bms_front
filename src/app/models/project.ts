import { CustomModel } from './custom-models/custom-model';
import { DateModelField } from './custom-models/date-model-field';
import { MultipleSelectModelField } from './custom-models/multiple-select-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { Donor } from './donor';
import { Sector } from './sector';


export class Project extends CustomModel {

    title = this.language.project;
    matSortActive = 'name';


    public fields = {
        id : new NumberModelField(
            {
                title: this.language.id,
                isDisplayedInTable: true,
            },
        ),
        name : new TextModelField(
            {
                title: this.language.project_name,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isLongText: false,
            }
        ),
        sectors : new MultipleSelectModelField (
            {
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                title: this.language.project_sectors_name,
                isSettable: true,
                options: undefined,
                bindField: 'name',
                isImageInTable: true,
                isEditable: true,
                value: [],
                apiLabel: 'id',
                isTranslatable: true
            }
        ),
        startDate : new DateModelField(
            {
                title: this.language.project_start_date,
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
                title: this.language.project_end_date,
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
                title: this.language.project_number_of_households,
                isDisplayedInModal: false,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
            }
        ),
        donors : new MultipleSelectModelField (
            {
                title: this.language.donors,
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
                isDisplayedInModal: false,
                isLongText: false,
            }
        ),
        target : new NumberModelField(
            {
                title: this.language.project_value,
                isRequired: true,
                isSettable: true,
                isDisplayedInSummary: true,
                isDisplayedInModal: true,
                isEditable: true,
            }
        ),
        reachedBeneficiaries: new NumberModelField ({
                title: this.language.add_distribution_beneficiaries_reached,
                isRequired: false,
                isSettable: false,
                isDisplayedInSummary: true,
                isDisplayedInModal: false,
                isEditable: false,
            }
        ),
        notes : new TextModelField(
            {
                title: this.language.notes,
                isSettable: true,
                isDisplayedInModal: true,
                isLongText: true,
                isEditable: true,
            }
        ),
    };


    public static apiToModel(projectFromApi: any): Project {
        const newProject = new Project();

        // Assign default fields
        newProject.set('id', projectFromApi.id);
        newProject.set('name', projectFromApi.name);
        newProject.set('startDate', DateModelField.formatFromApi(projectFromApi.start_date));
        newProject.set('endDate', DateModelField.formatFromApi(projectFromApi.end_date));
        newProject.set('numberOfHouseholds', projectFromApi.number_of_households);
        newProject.set('iso3', projectFromApi.iso3);
        newProject.set('target', projectFromApi.target);
        newProject.set('notes', projectFromApi.notes);

        // Assign select fields
        newProject.set('sectors',
            projectFromApi.sectors ?
            projectFromApi.sectors.map((sector: object) => Sector.apiToModel(sector)) :
            []);

        newProject.set('donors',
            projectFromApi.donors ?
            projectFromApi.donors.map((donor: object) => Donor.apiToModel(donor)) :
            []);

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
        newProject.set('reachedBeneficiaries', uniqueReachedBeneficiaries[0].size);
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
            target: this.fields.target.formatForApi(),
            notes: this.fields.notes.formatForApi(),
            sectors: this.fields.sectors.formatForApi(),
            donors: this.fields.donors.formatForApi(),
        };
    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }

}
