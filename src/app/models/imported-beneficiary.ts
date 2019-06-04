import { Beneficiary } from './beneficiary';
import { CustomModel } from './custom-models/custom-model';
import { NestedFieldModelField } from './custom-models/nested-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { DateModelField } from './custom-models/date-model-field';

export class ImportedBeneficiary extends CustomModel {

    title = this.language.beneficiary;
    matSortActive = 'localFamilyName';
    public fields = {
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: []
            }
        ),
        localGivenName: new NestedFieldModelField({
            title: this.language.beneficiary_given_name,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'localGivenName',
        }),
        localFamilyName: new NestedFieldModelField({
            title: this.language.beneficiary_family_name,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'localFamilyName',
        }),
        enGivenName: new NestedFieldModelField({
            title: this.language.beneficiary_en_given_name,
            isDisplayedInTable: false,
            childrenObject: 'beneficiary',
            childrenFieldName: 'enGivenName',
        }),
        enFamilyName: new NestedFieldModelField({
            title: this.language.beneficiary_en_family_name,
            isDisplayedInTable: false,
            childrenObject: 'beneficiary',
            childrenFieldName: 'enFamilyName',
        }),
        gender: new NestedFieldModelField({
            title: this.language.gender,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'gender',
        }),
        dateOfBirth: new NestedFieldModelField({
            title: this.language.beneficiary_date_of_birth,
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
        beneficiary.set('localGivenName',
            importedBeneficiaryFromApi.localGivenName ?
            importedBeneficiaryFromApi.localGivenName :
            importedBeneficiaryFromApi.local_given_name);
        beneficiary.set('localFamilyName',
            importedBeneficiaryFromApi.localFamilyName ?
            importedBeneficiaryFromApi.localFamilyName :
            importedBeneficiaryFromApi.local_family_name);
        beneficiary.set('enGivenName',
            importedBeneficiaryFromApi.enGivenName ?
            importedBeneficiaryFromApi.enGivenName :
            importedBeneficiaryFromApi.en_given_name);
        beneficiary.set('enFamilyName',
            importedBeneficiaryFromApi.enFamilyName ?
            importedBeneficiaryFromApi.enFamilyName :
            importedBeneficiaryFromApi.en_family_name);
        beneficiary.set('dateOfBirth',
            importedBeneficiaryFromApi.dateOfBirth ?
            DateModelField.formatFromApi(importedBeneficiaryFromApi.dateOfBirth) :
            importedBeneficiaryFromApi.date_of_birth);
        newImportedBeneficiary.set('beneficiary', beneficiary);

        return newImportedBeneficiary;
    }
}
