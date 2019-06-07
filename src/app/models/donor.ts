import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { FileModelField } from './custom-models/file-model-field';

export class Donor extends CustomModel {

    public static rights = ['ROLE_ADMIN'];

    title = this.language.model_donor;
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
                title: this.language.model_donor_fullname,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        shortname: new TextModelField(
            {
                title: this.language.model_donor_shortname,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        logo: new TextModelField({
            title: this.language.model_organization_logo,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        logoData: new FileModelField({
            title: this.language.model_organization_logo,
            isDisplayedInModal: true,
            isEditable: true,
            uploadPath: '/donor/upload/logo',
            fileUrlField: 'logo',
        }),
        notes: new TextModelField(
            {
                title: this.language.model_notes,
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
            id: this.get('id'),
            fullname: this.get('fullname'),
            shortname: this.get('shortname'),
            logo: this.get('logo'),
            notes: this.get('notes'),
        };
    }

    public getIdentifyingName() {
        return this.get<string>('fullname');
    }


}
