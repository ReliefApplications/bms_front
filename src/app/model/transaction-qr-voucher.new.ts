import { Beneficiary } from './beneficiary.new';
import { Booklet } from './booklet.new';
import { NestedFieldModelField } from './CustomModel/nested-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary.new';

export class TransactionQRVoucher extends DistributionBeneficiary {

    title = this.language.beneficiary;
    matSortActive = 'familyName';

    public fields = {
        // id: new NumberModelField({

        // }),
        beneficiary: new ObjectModelField<Beneficiary>({
            value: []
        }),
        booklet: new ObjectModelField<Booklet>({

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
        bookletCode: new NestedFieldModelField({
            title: this.language.model_booklet,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'code',
        }),
        status: new NestedFieldModelField({
            title: this.language.model_state,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'status',
        }),
        usedAt: new NestedFieldModelField({
            title: this.language.model_used,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'usedAt',
            nullValue: 'Not yet'
        }),
        value: new NestedFieldModelField({
            title: this.language.model_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'value',
        })
    };

    public static apiToModel(distributionBeneficiaryFromApi: any): TransactionQRVoucher {
        const newQRVoucher = new TransactionQRVoucher();
        newQRVoucher.set('beneficiary', Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary));

        let booklet = null;
        if (distributionBeneficiaryFromApi.booklets.length) {
            booklet = distributionBeneficiaryFromApi.booklets.filter((bookletFromApi: any) => bookletFromApi.status !== 3)[0];
            booklet = booklet ? booklet : distributionBeneficiaryFromApi.booklets[0];
        }
        newQRVoucher.set('booklet', booklet ? Booklet.apiToModel(booklet) : null);
        return newQRVoucher;
    }

    public modelToApi(): Object {
        return {
            given_name: this.get('benficiary').get('givenName'),
            family_name: this.get('benficiary').get('familyName'),
            booklet: this.get('booklet').modelToApi(),
        };
    }

    public isAssignable(): boolean {
        if (this.get('booklet') && this.get('booklet').get('status').get<string>('id') !== '3') {
            return false;
          }
          return true;
    }

    public isPrintable(): boolean {
        return this.get('booklet');
    }


}
