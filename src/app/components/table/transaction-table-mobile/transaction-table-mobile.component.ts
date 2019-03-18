import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TransactionTableComponent } from '../transaction-table/transaction-table.component';
import { DistributionData } from 'src/app/model/distribution-data';
import { GeneralRelief } from 'src/app/model/general-relief';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';


@Component({
  selector: 'app-transaction-table-mobile',
  templateUrl: './transaction-table-mobile.component.html',
  styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TransactionTableMobileComponent extends TransactionTableComponent {

  @Output() reloadTable = new EventEmitter<string>();

  print(element: any) {
    return this._exportService.printVoucher(element.booklet.id);
  }

  assign(element: any) {
    const dialogRef = this.dialog.open(ModalAssignComponent, {
      data: {
          beneficiary: element,
          project: this.parentObject.project,
          distribution: this.parentObject,
      }
    });
    dialogRef.afterClosed().subscribe((test) => {
      this.reloadTable.emit();
    });
  }

  isPrintable(element: any): boolean {
      return element.booklet;
  }

  isAssignable(element: any): boolean {
    if (element.booklet && element.booklet.status !== 3) {
      return false;
    }
    return true;
  }

}
