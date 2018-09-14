import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../table.component';
import { DistributionData } from '../../../model/distribution-data';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { Beneficiaries } from '../../../model/beneficiary';
import { Mapper } from '../../../core/utils/mapper.service';
import { MatDialog } from '@angular/material';
import { CacheService } from '../../../core/storage/cache.service';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class TransactionTableComponent extends TableComponent implements OnInit {

    distribution: DistributionData;

    constructor(
        public mapperService: Mapper,
        public dialog: MatDialog,
        public _cacheService: CacheService) {
            super(mapperService, dialog, _cacheService);
        }

    ngOnInit() {
        this.entity = Beneficiaries;
        this.service = BeneficiariesService;
    }

    getDistribution() {
    }

}
