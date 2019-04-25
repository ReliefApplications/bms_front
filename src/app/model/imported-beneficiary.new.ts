import { Beneficiary } from './beneficiary.new';
import { CustomModel } from './CustomModel/custom-model';
import { NestedFieldModelField } from './CustomModel/nested-field';
import { ObjectModelField } from './CustomModel/object-model-field';

export class ImportedBeneficiary extends CustomModel {

    title = this.language.beneficiary;
    matSortActive = 'familyName';
    public fields = {
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: []
            }
        ),
        givenName: new NestedFieldModelField({
            title: this.language.model_firstName,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'givenName',
        }),
        familyName: new NestedFieldModelField({
            title: this.language.model_familyName,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'familyName',
        }),
        gender: new NestedFieldModelField({
            title: this.language.gender,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'gender',
        }),
        dateOfBirth: new NestedFieldModelField({
            title: this.language.model_dateofbirth,
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
