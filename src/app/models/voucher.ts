import { CustomModel } from './custom-models/custom-model';
import { DateModelField } from './custom-models/date-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { ObjectModelField } from './custom-models/object-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { Vendor } from './vendor';

export class Voucher extends CustomModel {

    title = this.language.voucher;
    matSortActive = 'code';

    public fields = {
        id: new NumberModelField(
            {
              // Never displayed
            },
        ),
        // // before, was used as booklet code string
        // booklet: new ObjectModelField<Booklet>({
        //     title: this.language.booklet,
        // }),
        // before, was used as vendor (name ?) string
        vendor: new ObjectModelField<Vendor>({
            title: this.language.vendor,

        }),
        usedAt: new DateModelField({
            title: this.language.booklet_used,

        }),
        code: new TextModelField({
            title:  this.language.booklet_code,
        }),
        value: new NumberModelField({

        })
    };

    public static apiToModel(voucherFromApi: any): Voucher {
        const newVoucher = new Voucher();
        newVoucher.set('id', voucherFromApi.id);
        // newVoucher.set('booklet', voucherFromApi.booklet ? Booklet.apiToModel(voucherFromApi.booklet) : null);
        newVoucher.set('vendor', voucherFromApi.vendor ? Vendor.apiToModel(voucherFromApi.vendor) : null);
        newVoucher.set('usedAt', DateModelField.formatFromApi(voucherFromApi.used_at));
        newVoucher.set('code', voucherFromApi.code);
        newVoucher.set('value', voucherFromApi.value);

        return newVoucher;
    }
}
