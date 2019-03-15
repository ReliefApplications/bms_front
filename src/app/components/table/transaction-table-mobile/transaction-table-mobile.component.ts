import { Component, OnInit, Input } from '@angular/core';
import { TransactionTableComponent } from '../transaction-table/transaction-table.component';
import { DistributionData } from 'src/app/model/distribution-data';
import { GeneralRelief } from 'src/app/model/general-relief';


@Component({
  selector: 'app-transaction-table-mobile',
  templateUrl: './transaction-table-mobile.component.html',
  styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TransactionTableMobileComponent extends TransactionTableComponent {

  print(element: any) {
    return this._exportService.printVoucher(element.booklet.id);
  }

  isPrintable(element: any): boolean {
      return element.booklet;
  }

}
