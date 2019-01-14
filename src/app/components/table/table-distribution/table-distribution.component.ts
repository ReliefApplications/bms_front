import { Component, OnInit, ViewChild } from '@angular/core';

import { TableComponent } from '../table.component';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

@Component({
    selector: 'app-table-distribution',
    templateUrl: './table-distribution.component.html',
    styleUrls: ['../table.component.scss'],
})
export class TableDistributionComponent extends TableComponent {

    getImageName(t2: String) {
        return (t2.substring(26).split('.')[0]);
    }

    goToDistribution(id) {
        if (!this.networkService.getStatus()) {
            this._cacheService.get(AsyncacheService.DISTRIBUTIONS + "_" + id + "_beneficiaries")
                .subscribe(
                    result => {
                        if (!result) {
                            this.snackBar.open(this.table.cache_no_distribution, '', { duration: 5000, horizontalPosition: 'center' });
                        }
                        else {
                            this.router.navigate(['/projects/distributions/' + id]);
                        }
                    }
                );
        }
        else {
            this.router.navigate(['/projects/distributions/' + id]);
        }
    }
}
