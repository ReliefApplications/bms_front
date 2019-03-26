import { GlobalText } from 'src/texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class Donor extends CustomModel {

    public static rights = ['ROLE_ADMIN'];

    title = GlobalText.TEXTS.model_donor;

    // TODO: Fill with options
    fields = {
        id: new NumberModelField(
            {
                title: null,
            }
        ),
        fullname: new TextModelField(
            {
                title: GlobalText.TEXTS.model_donor_fullname,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        shortname: new TextModelField(
            {
                title: GlobalText.TEXTS.model_donor_shortname,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        notes: new TextModelField(
            {
                title: GlobalText.TEXTS.model_notes,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isLongText: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        // TODO delete?
        // projectsName: new CustomModelField<string[]>(
        //     {
        //         title: null,
        //     }
        // ),
    };

    constructor() {
        super();
    }

    public static apiToModel(donorFromApi: any): Donor {
        const newDonor = new Donor();

        newDonor.fields.id.value = donorFromApi.id;
        newDonor.fields.fullname.value = donorFromApi.fullname;
        newDonor.fields.shortname.value = donorFromApi.shortname;
        newDonor.fields.notes.value = donorFromApi.notes;

        return newDonor;
    }


}
