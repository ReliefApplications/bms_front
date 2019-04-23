import { GlobalText } from '../../texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { ObjectModelField } from './CustomModel/object-model-field';
import { Beneficiary } from './beneficiary.new';
import { NestedFieldModelField } from './CustomModel/nested-field';

export class ImportedBeneficiary extends CustomModel {

    title = GlobalText.TEXTS.beneficiary;
    matSortActive = 'familyName';
    public fields = {
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: []
            }
        ),
        givenName: new NestedFieldModelField({
            title: GlobalText.TEXTS.model_firstName,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'givenName',
        }),
        familyName: new NestedFieldModelField({
            title: GlobalText.TEXTS.model_familyName,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'familyName',
        }),
        gender: new NestedFieldModelField({
            title: GlobalText.TEXTS.gender,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'gender',
        }),
        dateOfBirth: new NestedFieldModelField({
            title: GlobalText.TEXTS.model_dateofbirth,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'dateOfBirth',
        }),

    };

    public static apiToModel(importedBeneficiaryFromApi): ImportedBeneficiary {
        const newImportedBeneficiary = new ImportedBeneficiary();
        // newImportedBeneficiary.set('beneficiary', Beneficiary.apiToModel(importedBeneficiaryFromApi));

        // TO DO : Use the line above when the api will be coherent in sending beneficiaries
        let beneficiary = new Beneficiary();
        beneficiary = Beneficiary.apiToModel(importedBeneficiaryFromApi);
        beneficiary.set('givenName',
            importedBeneficiaryFromApi.givenName ? importedBeneficiaryFromApi.givenName : importedBeneficiaryFromApi.given_name);
        beneficiary.set('familyName',
            importedBeneficiaryFromApi.familyName ? importedBeneficiaryFromApi.familyName : importedBeneficiaryFromApi.family_name);
        beneficiary.set('dateOfBirth',
            importedBeneficiaryFromApi.dateOfBirth ? importedBeneficiaryFromApi.dateOfBirth : importedBeneficiaryFromApi.date_of_birth);
        newImportedBeneficiary.set('beneficiary', beneficiary);

        return newImportedBeneficiary;
    }
}
