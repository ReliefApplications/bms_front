import { CustomModel } from './custom-models/custom-model';
import { Beneficiary } from './beneficiary';
import { ObjectModelField } from './custom-models/object-model-field';
import { BooleanModelField } from './custom-models/boolan-model-field';
import { TextModelField } from './custom-models/text-model-field';

export class DistributionBeneficiary extends CustomModel {
    public fields = {
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: null
            }
        ),
        removed: new BooleanModelField({

        }),
        justification: new TextModelField({
            title: this.language.justification,
            isLongText: true,
            isDisplayedInModal: false,
        }),
    };

    public static apiToModel(distributionBeneficiaryFromApi, distributionId: number): DistributionBeneficiary {
        const newDistributionBeneficiary = new DistributionBeneficiary();
        this.addCommonFields(newDistributionBeneficiary, distributionBeneficiaryFromApi, distributionId);
        return newDistributionBeneficiary;
    }

    public static addCommonFields(
        newDistributionBeneficiary: DistributionBeneficiary,
        distributionBeneficiaryFromApi: any,
        distributionId: number
    ) {
        newDistributionBeneficiary.set('removed', distributionBeneficiaryFromApi.removed);
        newDistributionBeneficiary.set('justification', distributionBeneficiaryFromApi.justification);

        if (newDistributionBeneficiary.get('justification')) {
            newDistributionBeneficiary.fields.justification.isDisplayedInModal = true;
            newDistributionBeneficiary.fields.justification.title = newDistributionBeneficiary.get('removed') ?
                newDistributionBeneficiary.language.beneficiary_justification_removed :
                newDistributionBeneficiary.language.beneficiary_justification_added;
        }

        if (Object.keys(distributionBeneficiaryFromApi.beneficiary ).length > 0) {
            const beneficiary = Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary);
            beneficiary.set('distributionId', distributionId);
            beneficiary.set('removed', distributionBeneficiaryFromApi.removed);
            if (newDistributionBeneficiary.get('justification')) {
                beneficiary.set('justification', distributionBeneficiaryFromApi.justification);
                beneficiary.fields.justification.isDisplayedInModal = true;
                beneficiary.fields.justification.title = beneficiary.get('removed') ?
                    newDistributionBeneficiary.language.beneficiary_justification_removed :
                    newDistributionBeneficiary.language.beneficiary_justification_added;
            }
            newDistributionBeneficiary.set('beneficiary', beneficiary);
        }

        return newDistributionBeneficiary;
    }

    public modelToApi(): Object {

        return {
           id: this.get('id'),
           beneficiary:  this.get('beneficiary') ? this.get('beneficiary').modelToApi() : null,
       };

    }
}
