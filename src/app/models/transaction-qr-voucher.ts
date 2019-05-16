import { Beneficiary } from './beneficiary';
import { Booklet } from './booklet';
import { NestedFieldModelField } from './custom-models/nested-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary';

export class TransactionQRVoucher extends DistributionBeneficiary {

    title = this.language.beneficiary;
    matSortActive = 'familyName';

    public fields = {...this.fields, ...{
        // id: new NumberModelField({

        // }),
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
            nullValue: this.language.null_not_yet
        }),
        value: new NestedFieldModelField({
            title: this.language.model_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'value',
        })
    }};

    public static apiToModel(distributionBeneficiaryFromApi: any, distributionId: number): TransactionQRVoucher {
        const newQRVoucher = new TransactionQRVoucher();

        let booklet = null;
        if (distributionBeneficiaryFromApi.booklets.length) {
            booklet = distributionBeneficiaryFromApi.booklets.filter((bookletFromApi: any) => bookletFromApi.status !== 3)[0];
            booklet = booklet ? booklet : distributionBeneficiaryFromApi.booklets[0];
        }
        newQRVoucher.set('booklet', booklet ? Booklet.apiToModel(booklet) : null);
        this.addCommonFields(newQRVoucher, distributionBeneficiaryFromApi, distributionId);
        return newQRVoucher;
    }

    public modelToApi(): Object {
        return {
            given_name: this.get('beneficiary').get('givenName'),
            family_name: this.get('beneficiary').get('familyName'),
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
