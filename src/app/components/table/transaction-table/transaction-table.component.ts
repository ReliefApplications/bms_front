import { Component, OnInit, Input } from '@angular/core';
import { TableComponent } from '../table.component';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['../table.component.scss'],
})
export class TransactionTableComponent extends TableComponent {

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
