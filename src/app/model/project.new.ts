import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { DateModelField } from './CustomModel/date-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { SelectModelField } from './CustomModel/select-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Donor } from './donor.new';
import { Sector } from './sector.new';


export class Project extends CustomModel {

    public static rights = ['ROLE_ADMIN', 'ROLE_COUNTRY_MANAGER', 'ROLE_PROJECT_MANAGER'];

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
        sectors : new SelectModelField<Sector[]>(
            {
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                title: GlobalText.TEXTS.model_sectors_name,
                isMultipleSelect: true,
                isSettable: true,
                options: undefined,
                bindField: 'name',
                isImageInTable: true,
                isEditable: true,
                value: [],
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
        donors : new SelectModelField<Donor[]>(
            {
                title: GlobalText.TEXTS.model_project_donors_name,
                isMultipleSelect: true,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                isDisplayedInTable: true,
                isSettable: true,
                options: undefined,
                bindField: 'shortName',
                isEditable: true,
                value: [],
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

        newProject.fields.id.value = projectFromApi.id;
        newProject.fields.name.value = projectFromApi.name;
        newProject.fields.startDate.value = projectFromApi.start_date;
        newProject.fields.endDate.value = projectFromApi.end_date;
        newProject.fields.numberOfHouseholds.value = projectFromApi.number_of_households;
        newProject.fields.iso3.value = projectFromApi.iso3;
        newProject.fields.value.value = projectFromApi.value;
        newProject.fields.notes.value = projectFromApi.notes;

        newProject.fields.sectors.value = projectFromApi.sectors.map((sector: object) => {
            return Sector.apiToModel(sector);
        });

        newProject.fields.donors.value = projectFromApi.donors.map((donor: object) => {
           return Donor.apiToModel(donor);
        });

        return newProject;
    }

    // public  modelToApi(object: Object): void {

    // }

}
