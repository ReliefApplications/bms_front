import { CustomModel } from './CustomModel/custom-model';
import { DateModelField } from './CustomModel/date-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Vendor } from './vendor.new';

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
        //     title: this.language.model_booklet,
        // }),
        // before, was used as vendor (name ?) string
        vendor: new ObjectModelField<Vendor>({
            title: this.language.model_vendor,

        }),
        usedAt: new DateModelField({
            title: this.language.model_used,

        }),
        code: new TextModelField({
            title:  this.language.model_code,
        }),
        value: new NumberModelField({

        })
    };

    public static apiToModel(voucherFromApi: any): Voucher {
        const newVoucher = new Voucher();
        newVoucher.set('id', voucherFromApi.id);
        // newVoucher.set('booklet', voucherFromApi.booklet ? Booklet.apiToModel(voucherFromApi.booklet) : null);
        newVoucher.set('vendor', voucherFromApi.vendor ? Vendor.apiToModel(voucherFromApi.vendor) : null);
        newVoucher.set('usedAt', voucherFromApi.used_at);
        newVoucher.set('code', voucherFromApi.code);
        newVoucher.set('value', voucherFromApi.value);

        return newVoucher;
    }
}
