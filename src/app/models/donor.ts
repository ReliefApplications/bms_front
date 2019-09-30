import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { FileModelField } from './custom-models/file-model-field';

export class Donor extends CustomModel {

    title = this.language.donor;
    matSortActive = 'fullname';

    // TODO: Fill with options
    fields = {
        id: new NumberModelField(
            {
                title: null,
            }
        ),
        fullname: new TextModelField(
            {
                title: this.language.donor_fullname,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        shortname: new TextModelField(
            {
                title: this.language.donor_shortname,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        logo: new TextModelField({
            title: this.language.organization_logo,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        logoData: new FileModelField({
            title: this.language.organization_logo,
            isDisplayedInModal: true,
            isEditable: true,
            isSettable: true,
            uploadPath: '/donor/upload/logo',
            fileUrlField: 'logo',
            acceptedTypes: ['gif', 'jpg', 'jpeg', 'png'],
        }),
        notes: new TextModelField(
            {
                title: this.language.notes,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isLongText: true,
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

        newDonor.set('id', donorFromApi.id);
        newDonor.set('fullname', donorFromApi.fullname);
        newDonor.set('shortname', donorFromApi.shortname);
        newDonor.set('logo', donorFromApi.logo);
        newDonor.set('notes', donorFromApi.notes);

        return newDonor;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            fullname: this.fields.fullname.formatForApi(),
            shortname: this.fields.shortname.formatForApi(),
            logo: this.fields.logo.formatForApi(),
            notes: this.fields.notes.formatForApi(),
        };
    }

    public getIdentifyingName() {
        return this.get<string>('fullname');
    }


}
