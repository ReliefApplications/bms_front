import { Sector } from './sector';
import { Donor } from './donor';
import { CustomModel as CustomModel } from './custom-model';
import { CustomModelField as CustomModelField } from './custom-model-field';
import { GlobalText } from '../../texts/global';

export class Project extends CustomModel {

    constructor() {
        super();
    }

    public fields = {
        id : new CustomModelField<number>(
            {
                title: null,
                placeholder: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
            },
        ),
        name : new CustomModelField<string>(
            {
                title: GlobalText.TEXTS.model_project_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        sectors : new CustomModelField<Sector[]>(
            {
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                title: GlobalText.TEXTS.model_sectors_name,
                isMultipleSelect: true,
                isSettable: true,
                options: undefined,
                bindField: 'name',
            }
        ),
        startDate : new CustomModelField<Date>(
            {
                title: GlobalText.TEXTS.model_project_start_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        endDate : new CustomModelField<Date>(
            {
                title: GlobalText.TEXTS.model_project_end_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        numberOfHouseholds : new CustomModelField<number>(
            {
                title: GlobalText.TEXTS.model_project_number_of_households,
                placeholder: null,
                isDisplayedInModal: false,
                isDisplayedInTable: true,
            }
        ),
        donors : new CustomModelField<Donor[]>(
            {
                title: GlobalText.TEXTS.model_project_donors_name,
                isMultipleSelect: true,
                placeholder: null,
                isDisplayedInModal: true,
                isSettable: true,
                options: undefined,
                bindField: 'shortname',
            }
        ),
        iso3 : new CustomModelField<string>(
            {
                title: null,
                placeholder: null,
                isDisplayedInModal: false,
            }
        ),
        value : new CustomModelField<number[]>(
            {
                title: GlobalText.TEXTS.model_project_value,
                placeholder: null,
                required: true,
                isSettable: true,
                isDisplayedInModal: false,
            }
        ),
        notes : new CustomModelField<string>(
            {
                title: GlobalText.TEXTS.model_notes,
                placeholder: null,
                isSettable: true,
                isUpdatable: true,
                isDisplayedInModal: true,
                isLongText: true,
            }
        ),
    };


    public  apiToModel(): Object {
        return new Object;
    }
    public  modelToApi(object: Object): void {

    }

}
