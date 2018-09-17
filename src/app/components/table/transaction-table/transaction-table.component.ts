import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../table.component';
import { DistributionData } from '../../../model/distribution-data';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { Beneficiaries } from '../../../model/beneficiary';
import { Mapper } from '../../../core/utils/mapper.service';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { CacheService } from '../../../core/storage/cache.service';
import { ImportedBeneficiary } from '../../../model/imported-beneficiary';
import { DistributionService } from '../../../core/api/distribution.service';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class TransactionTableComponent extends TableComponent implements OnInit {

    distribution: DistributionData;
    beneficiaries: any;
    loading = true;

    constructor(
        public mapperService: Mapper,
        public dialog: MatDialog,
        public _cacheService: CacheService,
        public distributionService: DistributionService) {
            super(mapperService, dialog, _cacheService);
        }

    ngOnInit() {
        this.entity = ImportedBeneficiary;
        this.service = BeneficiariesService;
        this.getDistribution();
    }

    getDistribution() {
        const distributionsList: DistributionData[] = this._cacheService.get(CacheService.DISTRIBUTIONS);

        if (distributionsList && this.parentId) {
            distributionsList.forEach(
                element => {
                    if (Number(element.id) === Number(this.parentId)) {
                        this.distribution = element;
                    }
                }
            );
        } else {
            console.log('missing cache get or distributionId in component call');
        }
    }

    getBeneficiaries() {
        this.loading = true;

        this.distributionService.getBeneficiaries(Number(this.parentId))
        .subscribe(
            response => {
                const data = response.json();

                this.beneficiaries = new MatTableDataSource(ImportedBeneficiary.formatArray(data));
                this.loading = false;
            },
            error => {
                // console.log("Error: ", error);
            }
        );
    }


}
