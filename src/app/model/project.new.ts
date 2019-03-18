import { Sector } from './sector';
import { Donor } from './donor';
import { CustomModel } from './CustomModel/custom-model';
import { TextModelField  } from './CustomModel/text-model-field';
import { GlobalText } from '../../texts/global';
import { SelectModelField } from './CustomModel/select-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { NumberModelField } from './CustomModel/number-model-field';

export class Project extends CustomModel {

    constructor() {
        super();
    }

    public fields = {
        id : new TextModelField(
            {
                title: null,
                placeholder: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
                isLongText: false,
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
                isDisplayedInTable: true,
                title: GlobalText.TEXTS.model_sectors_name,
                isMultipleSelect: true,
                isSettable: true,
                options: undefined,
                bindField: 'name',
            }
        ),
        startDate : new DateModelField(
            {
                title: GlobalText.TEXTS.model_project_start_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        endDate : new DateModelField(
            {
                title: GlobalText.TEXTS.model_project_end_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        numberOfHouseholds : new NumberModelField(
            {
                title: GlobalText.TEXTS.model_project_number_of_households,
                placeholder: null,
                isDisplayedInModal: false,
                isDisplayedInTable: true,
            }
        ),
        donors : new SelectModelField<Donor[]>(
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
                required: true,
                isSettable: true,
                isDisplayedInModal: false,
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
            }
        ),
    };


    public  apiToModel(): Object {
        return new Object;
    }
    public  modelToApi(object: Object): void {

    }

}
