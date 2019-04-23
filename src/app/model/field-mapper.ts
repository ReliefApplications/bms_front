import { Beneficiaries } from './beneficiary';
import { Booklet } from './booklet';
import { Commodity } from './commodity';
import { CountrySpecific } from './country-specific';
import { Criteria } from './criteria';
import { DistributionData } from './distribution-data';
import { Donor } from './donor';
import { FinancialProvider } from './financial-provider';
import { Households } from './households';
import { ImportedBeneficiary } from './imported-beneficiary';
import { Product } from './product';
import { Project } from './project';
import { TransactionBeneficiary } from './transaction-beneficiary';
import { TransactionGeneralRelief } from './transaction-general-relief';
import { TransactionVoucher } from './transaction-voucher';




export class FieldMapper {

    public getEntityTranslator(entityName: string) {
        switch (entityName) {
            case 'distribution_data': return DistributionData.translator();
            case 'donor': return Donor.translator();
            case 'commodity': return Commodity.translator();
            case 'criteria': return Criteria.translator();
            case 'country_specific': return CountrySpecific.translator();
            case 'households': return Households.translator();
            case 'project': return Project.translator();
            case 'beneficiaries': return Beneficiaries.translator();
            case 'imported_beneficiary': return ImportedBeneficiary.translator();
            case 'financial_provider': return FinancialProvider.translator();
            case 'booklet': return Booklet.translator();
            case 'product': return Product.translator();
            case 'transaction_beneficiary': return TransactionBeneficiary.translator();
            case 'transaction_general_relief': return TransactionGeneralRelief.translator();
            case 'transaction_voucher': return TransactionVoucher.translator();
        }
    }
}
