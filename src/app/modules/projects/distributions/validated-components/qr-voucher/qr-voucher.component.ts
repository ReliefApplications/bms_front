import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { SelectionModel } from '@angular/cdk/collections';
import { TransactionVoucher } from 'src/app/model/transaction-voucher';

@Component({
  selector: 'app-qr-voucher',
  templateUrl: './qr-voucher.component.html',
  styleUrls: ['../validated-distribution.component.scss']
})
export class QrVoucherComponent extends ValidatedDistributionComponent implements OnInit {
    checkedLines: any[] = [];
    distributed = false;
    loadingAssign = false;

    ngOnInit() {
        super.ngOnInit();
        this.selection = new SelectionModel<any>(true, []);
        this.entity = TransactionVoucher;
    }

    getChecked(event: any) {
        this.checkedLines = event;
    }


    // Total ammount assigned/distributed to a benefeciary
    getCommoditySentAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        const booklet = beneficiary.booklet;
        if (booklet) {
            return this.entity.getBookletTotalValue(booklet);
        } else {
            return 0;
        }
    }

    // Total amount used/spent by a beneficiary
    getCommodityReceivedAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        const booklet = beneficiary.booklet;
        if (booklet && booklet.status > 1) {
            return this.entity.getBookletTotalValue(booklet);
        } else {
            return 0;
        }
    }

}
