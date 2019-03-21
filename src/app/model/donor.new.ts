import { SectorMapper } from './sector-mapper';
import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { CustomModelField } from './CustomModel/custom-model-field';

export class Donor extends CustomModel {

    // TODO: Fill with options
    fields = {
        id: new NumberModelField(
            {
                title: null,
            }
        ),
        fullname: new TextModelField(
            {
                title: null,
            }
        ),
        dateAdded: new DateModelField(
            {
                title: null,
            }
        ),
        shortName: new TextModelField(
            {
                title: null,
            }
        ),
        notes: new TextModelField(
            {
                title: null,
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
        newDonor.fields.dateAdded.value = donorFromApi.dateAdded;
        newDonor.fields.shortName.value = donorFromApi.shortname;
        newDonor.fields.notes.value = donorFromApi.notes;

        return newDonor;
    }


}
