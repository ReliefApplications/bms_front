import { CustomModel } from './CustomModel/custom-model';
import { Beneficiary } from './beneficiary.new';
import { ObjectModelField } from './CustomModel/object-model-field';

export class DistributionBeneficiary extends CustomModel {
    public fields = {
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: []
            }
        )
    };

    public static apiToModel(distributionBeneficiaryFromApi): DistributionBeneficiary {
        const newDistributionBeneficiary = new DistributionBeneficiary();
        newDistributionBeneficiary.set('beneficiary', Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary));

        return newDistributionBeneficiary;
    }
}
