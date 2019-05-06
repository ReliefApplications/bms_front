import { CustomModel } from './CustomModel/custom-model';
import { Beneficiary } from './beneficiary';
import { ObjectModelField } from './CustomModel/object-model-field';

export class DistributionBeneficiary extends CustomModel {
    public fields = {
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: []
            }
        )
    };

    public static apiToModel(distributionBeneficiaryFromApi, distributionId: number): DistributionBeneficiary {
        const newDistributionBeneficiary = new DistributionBeneficiary();
        const beneficiary = Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary);
        beneficiary.set('distributionId', distributionId);
        newDistributionBeneficiary.set('beneficiary', beneficiary);

        return newDistributionBeneficiary;
    }
}
