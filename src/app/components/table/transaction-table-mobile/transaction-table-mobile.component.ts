import { Component, OnInit, Input } from '@angular/core';
import { TableComponent } from '../table.component';


@Component({
  selector: 'app-transaction-table-mobile',
  templateUrl: './transaction-table-mobile.component.html',
  styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TransactionTableMobileComponent extends TableComponent{

    loading = true;
    //
    // constructor(
    //     public mapperService: Mapper,
    //     public dialog: MatDialog,
    //     public _cacheService: CacheService,
    //     public distributionService: DistributionService,
    //     public snackBar: MatSnackBar) {
    //         super(mapperService, dialog, _cacheService, snackBar);
    //     }

}
