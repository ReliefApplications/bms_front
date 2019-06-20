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
            isLongText: true
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

        if (Object.keys(distributionBeneficiaryFromApi.beneficiary ).length > 0) {
            const beneficiary = Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary);
            beneficiary.set('distributionId', distributionId);
            beneficiary.set('removed', distributionBeneficiaryFromApi.removed);
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
