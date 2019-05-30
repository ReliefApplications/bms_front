import { Beneficiary } from './beneficiary';
import { Booklet } from './booklet';
import { NestedFieldModelField } from './custom-models/nested-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary';
import { MultipleObjectsModelField } from './custom-models/multiple-object-model-field';
import { Product } from './product';
import { UppercaseFirstPipe } from '../shared/pipes/uppercase-first.pipe';

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
            nullValue: this.language.null_not_yet
        }),
        value: new NestedFieldModelField({
            title: this.language.model_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'value',
        }),
        products: new MultipleObjectsModelField<Product>(
            {
                title: this.language.voucher_purchased,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                displayTableFunction: null,
                displayModalFunction: null,
                value: []
            }
        )
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

        const products: Product[] = [];
        if (booklet) {
            booklet.vouchers.forEach((voucher: any) => {
                voucher.products.forEach((product: any) => {
                    products.push(Product.apiToModel(product));
                });
            });
        }
        newQRVoucher.set('products', products);

        const pipe = new UppercaseFirstPipe();
        newQRVoucher.fields.products.displayTableFunction = value => value
            .map((product: Product) => pipe.transform(product.get('name'))).join(', ');
        newQRVoucher.fields.products.displayModalFunction = value => value
            .map((product: Product) => pipe.transform(product.get('name'))).join(', ');
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
