import { DistributionData                                  } from './distribution-data';
import { Donor                                             } from './donor';
import { Project                                           } from './project';
import { User                                     } from './user';
import { CountrySpecific                                   } from './country-specific';
import { Households                                        } from './households';
import { Criteria                                          } from './criteria';
import { Commodity                                         } from './commodity';
import { Beneficiaries                                     } from './beneficiary';
import { ImportedBeneficiary                               } from './imported-beneficiary';
import { TransactionBeneficiary } from './transaction-beneficiary';
import { FinancialProvider } from './financial-provider';
import { Booklet } from './booklet';

export class FieldMapper {

    public getEntityTranslator(entityName: string) {
        switch (entityName) {
            case 'distribution_data': return DistributionData.translator();
            case 'donor' : return Donor.translator();
            case 'commodity' : return Commodity.translator();
            case 'criteria' : return Criteria.translator();
            case 'country_specific' : return CountrySpecific.translator();
            case 'households' : return Households.translator();
            case 'project' : return Project.translator();
            case 'user' : return User.translator();
            case 'beneficiaries' : return Beneficiaries.translator();
            case 'imported_beneficiary' : return ImportedBeneficiary.translator();
            case 'transaction_beneficiary' : return TransactionBeneficiary.translator();
            case 'financial_provider' : return FinancialProvider.translator();
            case 'booklet' : return Booklet.translator();
        }
    }
}
