import { Sector } from './sector';
import { Donor } from './donor';
import { CustomModel as CustomModel } from './custom-model';
import { CustomModelField as CustomModelField } from './custom-model-field';
import { GlobalText } from '../../texts/global';


export class Project extends CustomModel {

    public fields = {
        id : new CustomModelField<number>(
            {
                title: null,
                placeholder: null,
                isHidden: true,
            }
        ),
        name : new CustomModelField<string>(
            {
                title: GlobalText.TEXTS.model_project_name,
                placeholder: null,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        sectors : new CustomModelField<Sector[]>(
            {
                placeholder: null,
                isDisplayedInTable: true,
                title: GlobalText.TEXTS.model_sectors_name,
                isMultipleSelect: true,
                isSettable: true,
                urlPath: 'sectors',
                optionLabel: 'name'
            }
        ),
        startDate : new CustomModelField<Date>(
            {
                title: GlobalText.TEXTS.model_project_start_date,
                placeholder: null,
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        endDate : new CustomModelField<Date>(
            {
                title: GlobalText.TEXTS.model_project_end_date,
                placeholder: null,
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        numberOfHouseholds : new CustomModelField<number>(
            {
                title: GlobalText.TEXTS.model_project_number_of_households,
                placeholder: null,
                isDisplayedInTable: true,
            }
        ),
        donors : new CustomModelField<Donor[]>(
            {
                title: GlobalText.TEXTS.model_project_donors_name,
                placeholder: null,
            }
        ),
        iso3 : new CustomModelField<string>(
            {
                title: null,
                placeholder: null,
            }
        ),
        value : new CustomModelField<number[]>(
            {
                title: GlobalText.TEXTS.model_project_value,
                placeholder: null,
                required: true,
                isSettable: true,
            }
        ),
        notes : new CustomModelField<string>(
            {
                title: GlobalText.TEXTS.model_notes,
                placeholder: null,
                isSettable: true,
                isUpdatable: true,
            }
        ),
    };

    constructor() {
        super();

    }

    public  apiToModel(): Object {
        return new Object;
    }
    public  modelToApi(object: Object): void {

    }

}
