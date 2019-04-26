import { Beneficiary } from './beneficiary.new';
import { ArrayInputField } from './CustomModel/array-input-field';
import { CustomModel } from './CustomModel/custom-model';
import { DateModelField } from './CustomModel/date-model-field';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { NestedFieldModelField } from './CustomModel/nested-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary.new';


export class GeneralRelief extends CustomModel {
    public fields = {
        id: new NumberModelField({}),
        notes: new TextModelField({}),
        distributedAt: new DateModelField({})
    };

    public static apiToModel(generalReliefFromApi): GeneralRelief {
        const newGeneralRelief = new GeneralRelief();
        newGeneralRelief.set('id', generalReliefFromApi.id);
        newGeneralRelief.set('notes', generalReliefFromApi.notes);
        newGeneralRelief.set('distributedAt', generalReliefFromApi.distributed_at);

        return newGeneralRelief;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            notes: this.get('notes'),
            distributed_at: this.fields.distributedAt.formatForApi(),

        };
    }
}


export class TransactionGeneralRelief extends DistributionBeneficiary {

    title = 'General Relief';
    matSortActive = 'familyName';

    public fields = {
        id: new NumberModelField({

        }),
        idTransaction: new NumberModelField({
            title: this.language.transaction_id_transaction,
            isDisplayedInTable: false,
            isDisplayedInModal: true,

        }),
        beneficiary: new ObjectModelField<Beneficiary>({
                value: []
        }),
        givenName: new NestedFieldModelField({
            title: this.language.model_firstName,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'givenName'
        }),
        familyName: new NestedFieldModelField({
            title: this.language.model_familyName,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'familyName'
        }),
        generalReliefs: new MultipleObjectsModelField<GeneralRelief>({

        }),
        distributedAt: new DateModelField({
            title: this.language.model_distributed,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            nullValue: this.language.null_not_distributed
        }),
        // Can only be filled by the distribution, in Distribution.apiToModel()
        values: new TextModelField({
            title: this.language.model_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,

        }),
        // Will be displayed in modal as an array of input field, but filled with a particular modal
        notes: new ArrayInputField<string>({
            title: this.language.model_notes,
            numberOfInputs: null,
            isDisplayedInModal: true,
            isEditable: true,
        }),
    };

    public static apiToModel(distributionBeneficiaryFromApi): TransactionGeneralRelief {
        const newGeneralRelief = new TransactionGeneralRelief();
        newGeneralRelief.set('beneficiary', Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary));
        newGeneralRelief.set('distributedAt', distributionBeneficiaryFromApi.general_reliefs[0] ?
            distributionBeneficiaryFromApi.general_reliefs[0].distributed_at :
            null);
        newGeneralRelief.set('notes', distributionBeneficiaryFromApi.general_reliefs.map((generalRelief: any) => generalRelief.notes));
        newGeneralRelief.set('generalReliefs',
            distributionBeneficiaryFromApi.general_reliefs.map((generalRelief: any) => GeneralRelief.apiToModel(generalRelief)));
        if (distributionBeneficiaryFromApi.transactions && distributionBeneficiaryFromApi.transactions.length > 0) {
            newGeneralRelief.set('idTransaction', distributionBeneficiaryFromApi.transactions[0].id);
        }
        newGeneralRelief.fields.notes.numberOfInputs = newGeneralRelief.get<GeneralRelief[]>('generalReliefs').length;
        return newGeneralRelief;
    }


    public modelToApi(): Object {

        return {
            id: this.get('id'),
            given_name: this.get('givenName'),
            family_name: this.get('familyName'),
            used: this.fields.distributedAt.formatForApi(),
            values: this.get('values'),
            notes: this.get('notes'),
        };

    }

    isCheckable() {
        return this.get('distributedAt') === null;
    }

}

