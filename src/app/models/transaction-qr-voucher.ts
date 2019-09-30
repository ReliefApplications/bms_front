import { UppercaseFirstPipe } from '../shared/pipes/uppercase-first.pipe';
import { Booklet } from './booklet';
import { MultipleObjectsModelField } from './custom-models/multiple-object-model-field';
import { NestedFieldModelField } from './custom-models/nested-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary';
import { Product } from './product';

export class TransactionQRVoucher extends DistributionBeneficiary {

    title = this.language.beneficiary;
    matSortActive = 'localFamilyName';

    public fields = {...{
        // Duplicated because needs to be the first column
        beneficiaryId: new NestedFieldModelField({
            title: this.language.beneficiary_id,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'id'
        }),
        booklet: new ObjectModelField<Booklet>({

        }),
        localGivenName: new NestedFieldModelField({
            title: this.language.beneficiary_given_name,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'localGivenName'
        }),
        localFamilyName: new NestedFieldModelField({
            title: this.language.beneficiary_family_name,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'localFamilyName'
        }),
        enGivenName: new NestedFieldModelField({
            title: this.language.beneficiary_en_given_name,
            isDisplayedInTable: false,
            isDisplayedInModal: false,
            childrenObject: 'beneficiary',
            childrenFieldName: 'enGivenName'
        }),
        enFamilyName: new NestedFieldModelField({
            title: this.language.beneficiary_en_family_name,
            isDisplayedInTable: false,
            isDisplayedInModal: false,
            childrenObject: 'beneficiary',
            childrenFieldName: 'enFamilyName'
        }),
        bookletCode: new NestedFieldModelField({
            title: this.language.booklet,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'code',
        }),
        status: new NestedFieldModelField({
            title: this.language.status,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'status',
        }),
        usedAt: new NestedFieldModelField({
            title: this.language.booklet_used,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'usedAt',
            nullValue: this.language.null_not_yet
        }),
        value: new NestedFieldModelField({
            title: this.language.value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            childrenObject: 'booklet',
            childrenFieldName: 'value',
        }),
        addReferral: new NestedFieldModelField({
            title: this.language.beneficiary_referral_question,
            isDisplayedInModal: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'addReferral',
            isEditable: true,
        }),
        referralType: new NestedFieldModelField({
            title: this.language.beneficiary_referral_type,
            isDisplayedInModal: false,
            childrenObject: 'beneficiary',
            childrenFieldName: 'referralType',
            isEditable: true,
        }),
        referralComment: new NestedFieldModelField({
            title: this.language.beneficiary_referral_comment,
            isDisplayedInModal: false,
            childrenObject: 'beneficiary',
            childrenFieldName: 'referralComment',
            isEditable: true,
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
    },
    ...this.fields
    };

    public static apiToModel(distributionBeneficiaryFromApi: any, distributionId: number): TransactionQRVoucher {
        const newQRVoucher = new TransactionQRVoucher();

        if (distributionBeneficiaryFromApi.beneficiary.referral) {
            newQRVoucher.fields.addReferral.isDisplayedInModal = false;
            newQRVoucher.fields.referralType.isDisplayedInModal = true;
            newQRVoucher.fields.referralComment.isDisplayedInModal = true;
        }

        let booklet = null;
        if (distributionBeneficiaryFromApi.booklets.length && Object.keys(distributionBeneficiaryFromApi.booklets[0]).length > 0) {
            booklet = distributionBeneficiaryFromApi.booklets.filter((bookletFromApi: any) => bookletFromApi.status !== 3)[0];
            booklet = booklet ? booklet : distributionBeneficiaryFromApi.booklets[0];
        }
        newQRVoucher.set('booklet', booklet ? Booklet.apiToModel(booklet) : null);
        this.addCommonFields(newQRVoucher, distributionBeneficiaryFromApi, distributionId);

        let products: Product[] = [];
        const productIds: number[] = [];
        if (distributionBeneficiaryFromApi.products) {
            products = distributionBeneficiaryFromApi.products.map((product: any) => {
                if (!productIds.includes(product.id)) {
                    productIds.push(product.id);
                    return Product.apiToModel(product);
                }
            });
        } else if (booklet) {
            booklet.vouchers.forEach((voucher: any) => {
                voucher.products.forEach((product: any) => {
                    if (!productIds.includes(product.id)) {
                        productIds.push(product.id);
                        products.push(Product.apiToModel(product));
                    }
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
            id: this.fields.beneficiaryId.formatForApi(),
            beneficiary: this.fields.beneficiary.formatForApi(),
            booklet: this.fields.booklet.formatForApi(),
            status: this.fields.status.formatForApi(),
            products: this.fields.products.formatForApi(),
            booklets: this.get('booklet') ? [this.get('booklet').modelToApi()] : [],
            // local_given_name: this.get('beneficiary').get('localGivenName'),
            // local_family_name: this.get('beneficiary').get('localFamilyName'),
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
