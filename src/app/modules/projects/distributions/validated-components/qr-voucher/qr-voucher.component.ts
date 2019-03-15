import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { SelectionModel } from '@angular/cdk/collections';
import { TransactionVoucher } from 'src/app/model/transaction-voucher';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

@Component({
  selector: 'app-qr-voucher',
  templateUrl: './qr-voucher.component.html',
  styleUrls: ['../validated-distribution.component.scss']
})
export class QrVoucherComponent extends ValidatedDistributionComponent implements OnInit {
    checkedLines: any[] = [];
    distributed = false;

    ngOnInit() {
        super.ngOnInit();
        this.selection = new SelectionModel<any>(true, []);
        this.entity = TransactionVoucher;
    }

    getChecked(event: any) {
        this.checkedLines = event;
    }
}
