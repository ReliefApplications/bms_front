import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../table.component';

@Component({
  selector: 'app-table-mobile-vouchers',
  templateUrl: './table-mobile-vouchers.component.html',
  styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TableMobileVouchersComponent extends TableComponent {
  print(element) {
    return this._exportService.printVoucher(element.id);
  }
}
